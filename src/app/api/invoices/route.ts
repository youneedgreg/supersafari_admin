// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { format } from 'date-fns';

// Define the interfaces
interface InvoiceRow extends RowDataPacket {
  id: string;
  client_id: number;
  client_name: string;
  amount: number;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  notes: string | null;
}

interface InvoiceItemRow extends RowDataPacket {
  id: number;
  invoice_id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceResponse {
  id: string;
  clientId: number;
  clientName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: string;
  notes: string | null;
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface InvoiceCreateRequest {
  clientId: number;
  date: string;
  dueDate: string;
  notes?: string;
  status: 'draft' | 'pending' | 'paid';
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

interface InvoiceUpdateRequest {
  id: string;
  clientId?: number;
  date?: string;
  dueDate?: string;
  notes?: string;
  status?: 'draft' | 'pending' | 'paid' | 'overdue';
}

// Helper function to generate next invoice ID
async function generateInvoiceId(): Promise<string> {
  try {
    const query = `
      SELECT MAX(SUBSTRING(id, 5)) as last_number
      FROM sgftw_invoices
      WHERE id LIKE 'INV-%'
    `;
    
    const result = await executeQuery(query) as RowDataPacket[];
    const lastNumber = result[0].last_number ? parseInt(result[0].last_number) : 0;
    const nextNumber = lastNumber + 1;
    
    return `INV-${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating invoice ID:', error);
    throw error;
  }
}

// Get all invoices
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, get a specific invoice with its items
    if (id) {
      // Get invoice details
      const invoiceQuery = `
        SELECT 
          i.id,
          i.client_id,
          c.name as client_name,
          i.amount,
          i.invoice_date,
          i.due_date,
          i.status,
          i.notes
        FROM 
          sgftw_invoices i
        JOIN 
          sgftw_reservation_submissions c ON i.client_id = c.id
        WHERE 
          i.id = ?
      `;
      
      const invoiceResult = await executeQuery(invoiceQuery, [id]) as InvoiceRow[];
      
      if (invoiceResult.length === 0) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      
      const invoice = invoiceResult[0];
      
      // Get invoice items
      const itemsQuery = `
        SELECT 
          id,
          invoice_id,
          description,
          quantity,
          price,
          total
        FROM 
          sgftw_invoice_items
        WHERE 
          invoice_id = ?
        ORDER BY
          id ASC
      `;
      
      const itemsResult = await executeQuery(itemsQuery, [id]) as InvoiceItemRow[];
      
      const formattedInvoice: InvoiceResponse = {
        id: invoice.id,
        clientId: invoice.client_id,
        clientName: invoice.client_name,
        amount: Number(invoice.amount),
        date: format(new Date(invoice.invoice_date), 'MMMM d, yyyy'),
        dueDate: format(new Date(invoice.due_date), 'MMMM d, yyyy'),
        status: invoice.status,
        notes: invoice.notes,
        items: itemsResult.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total)
        }))
      };
      
      return NextResponse.json(formattedInvoice);
    }
    
    // Get all invoices
    const query = `
      SELECT 
        i.id,
        i.client_id,
        c.name as client_name,
        i.amount,
        i.invoice_date,
        i.due_date,
        i.status,
        i.notes
      FROM 
        sgftw_invoices i
      JOIN 
        sgftw_reservation_submissions c ON i.client_id = c.id
      ORDER BY 
        i.created_at DESC
    `;
    
    const rows = await executeQuery(query) as InvoiceRow[];
    
    // Format the result
    const formattedResults: Omit<InvoiceResponse, 'items'>[] = rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      amount: Number(row.amount),
      date: format(new Date(row.invoice_date), 'MMMM d, yyyy'),
      dueDate: format(new Date(row.due_date), 'MMMM d, yyyy'),
      status: row.status,
      notes: row.notes
    }));
    
    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// Create a new invoice
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: InvoiceCreateRequest = await request.json();
    
    // Validate required fields
    if (!body.clientId || !body.date || !body.dueDate || !body.items || !body.items.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate total amount
    const totalAmount = body.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    // Generate new invoice ID
    const invoiceId = await generateInvoiceId();
    
    // Start a transaction
    await executeQuery('START TRANSACTION');
    
    try {
      // Insert invoice
      const invoiceQuery = `
        INSERT INTO sgftw_invoices (
          id,
          client_id,
          amount,
          invoice_date,
          due_date,
          status,
          notes,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await executeQuery(invoiceQuery, [
        invoiceId,
        body.clientId,
        totalAmount,
        body.date,
        body.dueDate,
        body.status || 'draft',
        body.notes || null
      ]);
      
      // Insert invoice items
      for (const item of body.items) {
        const itemTotal = item.quantity * item.price;
        
        const itemQuery = `
          INSERT INTO sgftw_invoice_items (
            invoice_id,
            description,
            quantity,
            price,
            total,
            created_at
          ) VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        await executeQuery(itemQuery, [
          invoiceId,
          item.description,
          item.quantity,
          item.price,
          itemTotal
        ]);
      }
      
      // Commit transaction
      await executeQuery('COMMIT');
      
      return NextResponse.json({
        message: 'Invoice created successfully',
        id: invoiceId
      }, { status: 201 });
    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// Update invoice status or details
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: InvoiceUpdateRequest = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }
    
    // Build update query based on provided fields
    const updateFields: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    
    if (body.clientId !== undefined) {
      updateFields.push('client_id = ?');
      params.push(body.clientId);
    }
    
    if (body.date !== undefined) {
      updateFields.push('invoice_date = ?');
      params.push(body.date);
    }
    
    if (body.dueDate !== undefined) {
      updateFields.push('due_date = ?');
      params.push(body.dueDate);
    }
    
    if (body.status !== undefined) {
      updateFields.push('status = ?');
      params.push(body.status);
    }
    
    if (body.notes !== undefined) {
      updateFields.push('notes = ?');
      params.push(body.notes);
    }
    
    updateFields.push('updated_at = NOW()');
    
    // Add invoice ID to params
    params.push(body.id);
    
    const query = `
      UPDATE sgftw_invoices
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(query, params);
    
    return NextResponse.json({
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// Delete an invoice
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }
    
    // Delete invoice (the items will be deleted automatically due to CASCADE constraint)
    const query = 'DELETE FROM sgftw_invoices WHERE id = ?';
    const result = await executeQuery(query, [id]) as ResultSetHeader;
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { logActivity } from '@/lib/logger';
import { notifyClientCreated, notifyClientStatusChanged, notifyClientDeleted } from '@/lib/notifications';

interface ClientRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  passport: string;
  tour_name: string;
  arrival_date: string;
  departure_date: string;
  flight_details: string;
  adults: number;
  children: number;
  partner_details: string;
  special_requirements: string;
  next_of_kin: string;
  next_of_kin_email: string;
  status: string;
  submission_date: string;
  processed: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get status from query params if available
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    
    // Build the query based on filters
    let query = 'SELECT * FROM sgftw_reservation_submissions WHERE arrival_date IS NOT NULL AND departure_date IS NOT NULL AND arrival_date != "" AND departure_date != ""';
    const queryParams: (string | number)[] = [];
    
    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
      
      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        queryParams.push(`%${search}%`);
        queryParams.push(`%${search}%`);
      }
    } else if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      queryParams.push(`%${search}%`);
      queryParams.push(`%${search}%`);
    }
    
    query += ' ORDER BY submission_date DESC';
    
    // Execute the query using executeQuery instead of pool.query
    const clients = await executeQuery(query, queryParams) as ClientRow[];
    
    // Format any BigInt values for JSON serialization if needed
    const formattedClients = clients.map(client => ({
      ...client,
      id: Number(client.id),
      adults: Number(client.adults),
      children: Number(client.children),
      processed: Number(client.processed)
    }));
    
    return NextResponse.json({ 
      status: 'OK',
      clients: formattedClients
    });
    
  } catch (error: any) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ 
      status: 'ERROR',
      message: 'Failed to fetch clients',
      error: { name: error.name, message: error.message } 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientData = await request.json();
    
    // Current date for submission_date
    const submissionDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Validate that both arrival and departure dates are provided
    if (!clientData.arrival || !clientData.departure) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Both arrival and departure dates are required'
      }, { status: 400 });
    }
    
    // SQL to insert a new client
    const query = `
      INSERT INTO sgftw_reservation_submissions (
        name, email, phone, location, passport, tour_name, 
        arrival_date, departure_date, flight_details, adults, 
        children, partner_details, special_requirements, 
        next_of_kin, next_of_kin_email, status, submission_date, processed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    
    const params: (string | number | null)[] = [
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.location,
      clientData.passport,
      clientData.tourName,
      clientData.arrival,
      clientData.departure,
      clientData.flightDetails,
      clientData.adults,
      clientData.children,
      clientData.partnerDetails,
      clientData.diet,
      clientData.nextOfKin,
      clientData.emailOfKin,
      'planning', // Default status
      submissionDate
    ];
    
    // Use executeQuery instead of pool.query
    const result = await executeQuery(query, params) as { insertId: number };
    
    // After successfully adding the client
    await logActivity({
      actionType: 'CREATE',
      actionDescription: `Added new client: ${clientData.name}`,
      entityType: 'CLIENT',
      entityId: result.insertId,
      request
    });

    // Create notification for new client
    await notifyClientCreated(result.insertId, clientData.name);
    
    return NextResponse.json({
      status: 'OK',
      message: 'Client added successfully',
      clientId: result.insertId
    });
    
  } catch (error: any) {
    console.error('Failed to add client:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to add client',
      error: { name: error.name, message: error.message }
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...clientData } = await request.json();

    // ... existing code ...

    // After successfully updating the client
    await logActivity({
      actionType: 'UPDATE',
      actionDescription: `Updated client: ${clientData.name}`,
      entityType: 'CLIENT',
      entityId: id,
      request
    });

    return NextResponse.json({ 
      status: 'OK',
      message: 'Client updated successfully'
    });
  } catch (error: any) {
    // ... existing code ...
  }
}

// Add a new endpoint to handle status changes
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Client ID and status are required'
      }, { status: 400 });
    }

    // Get current status before update
    const currentStatusQuery = 'SELECT status, name FROM sgftw_reservation_submissions WHERE id = ?';
    const currentStatus = await executeQuery(currentStatusQuery, [id]) as RowDataPacket[];
    
    if (currentStatus.length === 0) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Client not found'
      }, { status: 404 });
    }

    // Update status
    const updateQuery = 'UPDATE sgftw_reservation_submissions SET status = ? WHERE id = ?';
    await executeQuery(updateQuery, [status, id]);

    // Log the activity
    await logActivity({
      actionType: 'UPDATE',
      actionDescription: `Updated client status to ${status}`,
      entityType: 'CLIENT',
      entityId: id,
      request
    });

    // Create notification for status change
    await notifyClientStatusChanged(
      id,
      currentStatus[0].name,
      currentStatus[0].status,
      status
    );
    
    return NextResponse.json({
      status: 'OK',
      message: 'Client status updated successfully'
    });
    
  } catch (error: any) {
    console.error('Failed to update client status:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to update client status',
      error: { name: error.name, message: error.message }
    }, { status: 500 });
  }
}

// Add DELETE endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Client ID is required'
      }, { status: 400 });
    }

    // Get client details before deletion
    const clientQuery = 'SELECT name FROM sgftw_reservation_submissions WHERE id = ?';
    const client = await executeQuery(clientQuery, [id]) as RowDataPacket[];
    
    if (client.length === 0) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Client not found'
      }, { status: 404 });
    }

    // Delete client
    const deleteQuery = 'DELETE FROM sgftw_reservation_submissions WHERE id = ?';
    await executeQuery(deleteQuery, [id]);

    // Log the activity
    await logActivity({
      actionType: 'DELETE',
      actionDescription: `Deleted client: ${client[0].name}`,
      entityType: 'CLIENT',
      entityId: Number(id),
      request
    });

    // Create notification for client deletion
    await notifyClientDeleted(client[0].name);
    
    return NextResponse.json({
      status: 'OK',
      message: 'Client deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Failed to delete client:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to delete client',
      error: { name: error.name, message: error.message }
    }, { status: 500 });
  }
}
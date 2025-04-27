/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/clients/[id]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { NextRequest } from 'next/server';

// Define the params type according to Next.js requirements
interface Params {
  params: {
    id: string;
  };
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = params;
    const updateData = await request.json();
    
    // Build the query based on what fields are being updated
    let query = 'UPDATE sgftw_reservation_submissions SET ';
    const queryParams: (string | number)[] = [];
    const updates: string[] = [];
    
    // Handle different fields that could be updated
    if (updateData.status) {
      updates.push('status = ?');
      queryParams.push(updateData.status);
    }
    
    if (updateData.notes) {
      updates.push('additional_info = ?');
      queryParams.push(updateData.notes);
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ 
        status: 'ERROR',
        message: 'No fields to update' 
      }, { status: 400 });
    }
    
    query += updates.join(', ') + ' WHERE id = ?';
    queryParams.push(Number(id));
    
    // Execute the query using executeQuery
    await executeQuery(query, queryParams);
    
    return NextResponse.json({ 
      status: 'OK',
      message: 'Client updated successfully' 
    });
    
  } catch (error: any) {
    console.error('Failed to update client:', error);
    return NextResponse.json({ 
      status: 'ERROR',
      message: 'Failed to update client',
      error: { name: error.name, message: error.message } 
    }, { status: 500 });
  }
}
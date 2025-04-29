/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';

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
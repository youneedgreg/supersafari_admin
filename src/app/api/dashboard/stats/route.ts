import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Define the interface for the stats result
interface StatsRow extends RowDataPacket {
  totalClients: number;
  planning: number;
  confirmed: number;
  booked: number;
  completed: number;
}

export async function GET() {
  try {
    // Query to get all the stats at once for better performance
    const query = `
      SELECT 
        COUNT(*) as totalClients,
        SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM sgftw_reservation_submissions
      WHERE 
       departure_date IS NOT NULL
        AND departure_date != ''
      
    `;
    
    // Use the executeQuery function instead of managing connections manually
    const rows = await executeQuery(query) as StatsRow[];
    
    // Get the first row from the results
    const firstRow = rows[0];
    
    // Convert BigInt to Number for JSON serialization
    const stats = {
      totalClients: Number(firstRow.totalClients),
      planning: Number(firstRow.planning),
      confirmed: Number(firstRow.confirmed),
      booked: Number(firstRow.booked),
      completed: Number(firstRow.completed)
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
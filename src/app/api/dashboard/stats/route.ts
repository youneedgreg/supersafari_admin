import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    const connection = await connectDB();
    
    // Query to get all the stats at once for better performance
    const query = `
      SELECT 
        COUNT(*) as totalClients,
        SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM sgftw_reservation_submissions
    `;
    
    const [results] = await connection.query(query);
    connection.end();
    
    // Convert BigInt to Number for JSON serialization
    const stats = {
      totalClients: Number(results[0].totalClients),
      planning: Number(results[0].planning),
      confirmed: Number(results[0].confirmed),
      booked: Number(results[0].booked),
      completed: Number(results[0].completed)
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
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { format } from 'date-fns';
import { RowDataPacket } from 'mysql2';

// Define the interface for arrivals results
interface ArrivalRow extends RowDataPacket {
  name: string;
  arrivalDate: string;
  totalGuests: number;
  status: string;
}

export async function GET() {
  try {
    const connection = await connectDB();
    
    // Current date in MySQL format
    const today = format(new Date(), 'yyyy-MM-dd');
    const nextWeek = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    // Query to get upcoming arrivals in the next 7 days
    // Note: Since arrival_date is stored as VARCHAR, we need to use STR_TO_DATE to compare dates
    const query = `
      SELECT 
        name, 
        arrival_date as arrivalDate, 
        COALESCE(adults, 0) + COALESCE(children, 0) as totalGuests, 
        status
      FROM 
        sgftw_reservation_submissions
      WHERE 
        status IN ('confirmed', 'booked') 
        AND STR_TO_DATE(arrival_date, '%Y-%m-%d') >= ?
        AND STR_TO_DATE(arrival_date, '%Y-%m-%d') <= ?
      ORDER BY 
        STR_TO_DATE(arrival_date, '%Y-%m-%d') ASC
      LIMIT 3
    `;
    
    const [rows] = await connection.query<ArrivalRow[]>(query, [today, nextWeek]);
    connection.end();
    
    // Format dates to be more user-friendly
    const formattedResults = rows.map(row => ({
      ...row,
      arrivalDate: format(new Date(row.arrivalDate), 'MMM dd, yyyy'),
      totalGuests: Number(row.totalGuests)
    }));
    
    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming arrivals' },
      { status: 500 }
    );
  }
}
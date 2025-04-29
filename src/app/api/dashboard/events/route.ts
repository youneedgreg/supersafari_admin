import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { RowDataPacket } from 'mysql2';

// Define the interface for calendar events
interface EventRow extends RowDataPacket {
  id: number;
  name: string;
  arrivalDate: string;
  departureDate: string;
  status: string;
  totalGuests: number;
}

export async function GET() {
  try {
    // Get date range for the current month and next month for the calendar
    const today = new Date();
    const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(addMonths(today, 1)), 'yyyy-MM-dd');
    
    // Query to get both arrivals and departures for the calendar
    const query = `
      SELECT 
        id,
        name,
        arrival_date as arrivalDate,
        departure_date as departureDate,
        status,
        COALESCE(adults, 0) + COALESCE(children, 0) as totalGuests
      FROM 
        sgftw_reservation_submissions
      WHERE 
        (STR_TO_DATE(arrival_date, '%Y-%m-%d') BETWEEN ? AND ?) 
        OR (STR_TO_DATE(departure_date, '%Y-%m-%d') BETWEEN ? AND ?)
        AND departure_date IS NOT NULL
        AND departure_date != ''
        AND arrival_date IS NOT NULL
        AND arrival_date != ''
      ORDER BY 
        STR_TO_DATE(arrival_date, '%Y-%m-%d')
    `;
    
    // Use the executeQuery function instead of managing connections manually
    const rows = await executeQuery(query, [startDate, endDate, startDate, endDate]) as EventRow[];
    
    // Normalize results for the frontend
    const formattedResults = rows.map(row => ({
      ...row,
      id: Number(row.id),
      totalGuests: Number(row.totalGuests)
    }));
    
    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { format } from 'date-fns';
import { RowDataPacket } from 'mysql2';

interface ArrivalRow extends RowDataPacket {
  name: string;
  arrivalDate: string;
  totalGuests: number;
  status: string;
}

export async function GET() {
  try {
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
        AND departure_date IS NOT NULL
      ORDER BY 
        STR_TO_DATE(arrival_date, '%Y-%m-%d') ASC
      LIMIT 3
    `;

    const rows = await executeQuery(query) as ArrivalRow[];

    const formattedResults = rows.map(row => ({
      ...row,
      arrivalDate: format(new Date(row.arrivalDate), 'MMM dd, yyyy'),
      totalGuests: Number(row.totalGuests),
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

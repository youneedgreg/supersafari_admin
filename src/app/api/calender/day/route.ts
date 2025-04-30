// app/api/calendar/day/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { format, parseISO } from 'date-fns';
import { RowDataPacket } from 'mysql2';

// Define the interfaces for calendar events
interface EventRow extends RowDataPacket {
  id: number;
  name: string;
  arrival_date?: string;
  departure_date?: string;
  due_date?: string;
  event_type: string;
  status: string;
  title?: string;
  description?: string;
  priority?: string;
  adults?: number;
  children?: number;
  client_id?: number;
  client_name?: string;
}

interface DayEvent {
  id: number;
  title: string;
  type: 'arrival' | 'departure' | 'task';
  status: string;
  details: string;
  clientId?: number | null;
  clientName?: string | null;
  totalGuests?: number;
  priority?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get date parameter
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Validate date parameter
    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    
    // Parse and format date for SQL query
    const date = format(parseISO(dateParam), 'yyyy-MM-dd');
    
    // Initialize array for day events
    const events: DayEvent[] = [];
    
    // Fetch reservations with arrival or departure on this day
    const reservationQuery = `
      SELECT
        id,
        name,
        arrival_date,
        departure_date,
        status,
        'reservation' as event_type,
        COALESCE(adults, 0) as adults,
        COALESCE(children, 0) as children,
        client_id
      FROM
        sgftw_reservation_submissions
      WHERE
        STR_TO_DATE(arrival_date, '%Y-%m-%d') = ?
        OR STR_TO_DATE(departure_date, '%Y-%m-%d') = ?
      ORDER BY
        name
    `;
    
    const reservationRows = await executeQuery(reservationQuery, [date, date]) as EventRow[];
    
    // Process reservation rows into arrival and departure events
    for (const row of reservationRows) {
      const totalGuests = (row.adults || 0) + (row.children || 0);
      
      // Add arrival event if it matches the requested date
      if (row.arrival_date && format(parseISO(row.arrival_date), 'yyyy-MM-dd') === date) {
        events.push({
          id: Number(row.id) * 100, // Ensure unique ID for arrival events
          title: `${row.name} Arrival`,
          type: 'arrival',
          status: row.status,
          details: `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}`,
          clientId: row.client_id ? Number(row.client_id) : null,
          clientName: row.name,
          totalGuests
        });
      }
      
      // Add departure event if it matches the requested date
      if (row.departure_date && format(parseISO(row.departure_date), 'yyyy-MM-dd') === date) {
        events.push({
          id: Number(row.id) * 100 + 1, // Ensure unique ID for departure events
          title: `${row.name} Departure`,
          type: 'departure',
          status: row.status,
          details: `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}`,
          clientId: row.client_id ? Number(row.client_id) : null,
          clientName: row.name,
          totalGuests
        });
      }
    }
    
    // Fetch tasks due on this day
    const taskQuery = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.due_date,
        t.priority,
        t.status,
        'task' as event_type,
        t.client_id,
        c.name as client_name
      FROM
        sgftw_tasks t
      LEFT JOIN
        sgftw_clients c ON t.client_id = c.id
      WHERE
        STR_TO_DATE(t.due_date, '%Y-%m-%d') = ?
      ORDER BY
        FIELD(t.priority, 'high', 'medium', 'low'),
        t.title
    `;
    
    const taskRows = await executeQuery(taskQuery, [date]) as EventRow[];
    
    // Process task rows into task events
    for (const row of taskRows) {
      events.push({
        id: Number(row.id) * 1000, // Ensure unique ID for task events
        title: row.title || '',
        type: 'task',
        status: row.status,
        details: row.client_name ? `Client: ${row.client_name}` : row.description || '',
        clientId: row.client_id ? Number(row.client_id) : null,
        clientName: row.client_name || null,
        priority: row.priority
      });
    }
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Calendar day API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch day events' },
      { status: 500 }
    );
  }
}
// app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from 'date-fns';
import { RowDataPacket } from 'mysql2';

// Define the interfaces for calendar events
interface EventRow extends RowDataPacket {
  id: number;
  name: string;
  arrivalDate: string;
  departureDate: string;
  status: string;
  totalGuests: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
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
    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Parse date range parameters
    const monthsAhead = parseInt(searchParams.get('monthsAhead') || '1');
    const monthsBehind = parseInt(searchParams.get('monthsBehind') || '0');
    const eventTypes = searchParams.get('types')?.split(',') || ['arrival', 'departure', 'task'];
    
    // Set default date range
    const baseDate = new Date();
    const startDate = format(startOfMonth(subMonths(baseDate, monthsBehind)), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(addMonths(baseDate, monthsAhead)), 'yyyy-MM-dd');
    
    // Initialize array for all events
    const events: CalendarEvent[] = [];

    // Fetch reservations (arrivals and departures) if needed
    if (eventTypes.includes('arrival') || eventTypes.includes('departure')) {
      const reservationQuery = `
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
          (STR_TO_DATE(arrival_date, '%Y-%m-%d') BETWEEN ? AND ? 
           OR STR_TO_DATE(departure_date, '%Y-%m-%d') BETWEEN ? AND ?)
          AND departure_date IS NOT NULL
          AND departure_date != ''
          AND arrival_date IS NOT NULL
          AND arrival_date != ''
        ORDER BY
          STR_TO_DATE(arrival_date, '%Y-%m-%d')
      `;
      
      const reservationRows = await executeQuery(reservationQuery, [startDate, endDate, startDate, endDate]) as EventRow[];
      
      // Process reservation rows into arrival and departure events
      for (const row of reservationRows) {
        const totalGuests = Number(row.totalGuests);
        
        // Add arrival event if in date range and type is requested
        if (row.arrivalDate && eventTypes.includes('arrival')) {
          events.push({
            id: Number(row.id) * 100, // Ensure unique ID for arrival events
            title: `${row.name} Arrival`,
            date: row.arrivalDate,
            type: 'arrival',
            status: row.status,
            details: `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}`,
            clientId: row.id ? Number(row.id) : null,
            clientName: row.name,
            totalGuests
          });
        }
        
        // Add departure event if in date range and type is requested
        if (row.departureDate && eventTypes.includes('departure')) {
          events.push({
            id: Number(row.id) * 100 + 1, // Ensure unique ID for departure events
            title: `${row.name} Departure`,
            date: row.departureDate,
            type: 'departure',
            status: row.status,
            details: `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}`,
            clientId: row.id ? Number(row.id) : null,
            clientName: row.name,
            totalGuests
          });
        }
      }
    }
    
    // Fetch tasks if needed
    if (eventTypes.includes('task')) {
      const taskQuery = `
        SELECT
          t.id,
          t.title,
          t.description,
          t.due_date,
          t.priority,
          t.status,
          'task' as event_type,
          t.id,
          c.name as client_name
        FROM
          sgftw_tasks t
        LEFT JOIN
          sgftw_reservation_submissions c ON t.id = c.id
        WHERE
          STR_TO_DATE(t.due_date, '%Y-%m-%d') BETWEEN ? AND ?
        ORDER BY
          STR_TO_DATE(t.due_date, '%Y-%m-%d')
      `;
      
      const taskRows = await executeQuery(taskQuery, [startDate, endDate]) as EventRow[];
      
      // Process task rows into task events
      for (const row of taskRows) {
        events.push({
          id: Number(row.id) * 1000, // Ensure unique ID for task events
          title: row.title || '',
          date: row.due_date || '',
          type: 'task',
          status: row.status,
          details: row.client_name ? `Client: ${row.client_name}` : row.description || '',
          clientId: row.id ? Number(row.id) : null,
          clientName: row.client_name || null,
          priority: row.priority
        });
      }
    }
    
    // Sort all events by date
    events.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
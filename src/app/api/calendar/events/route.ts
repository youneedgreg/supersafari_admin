// app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Extract the event type and remove it from data we'll insert
    const { type, ...dataToInsert } = eventData;
    
    // Determine which table to insert into based on event type
    let table;
    let insertData;
    
    if (type === 'arrival' || type === 'departure') {
      table = 'sgftw_reservation_submissions';
      
      // Format reservation data properly
      insertData = {
        id: dataToInsert.id,
        name: dataToInsert.name || null, // Will be fetched from client if not provided
        arrival_date: type === 'arrival' ? dataToInsert.arrival_date : null,
        departure_date: type === 'departure' ? dataToInsert.departure_date : 
                       (dataToInsert.departure_date || null),
        status: dataToInsert.status || 'planning',
        adults: dataToInsert.adults || dataToInsert.guests || 1,
        children: dataToInsert.children || 0,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      
      // If we don't have a name but have a id, fetch the client name
      if (!insertData.name && insertData.id) {
        const clientQuery = 'SELECT name FROM sgftw_reservation_submissions WHERE id = ?';
        const clientResult = await executeQuery(clientQuery, [insertData.id]);
        
        if (Array.isArray(clientResult) && clientResult.length > 0) {
          insertData.name = clientResult[0].name;
        }
      }
    } else if (type === 'task') {
      table = 'sgftw_tasks';
      
      // Format task data properly
      insertData = {
        title: dataToInsert.title,
        description: dataToInsert.description || '',
        due_date: dataToInsert.due_date,
        priority: dataToInsert.priority || 'medium',
        status: dataToInsert.status || 'pending',
        id: dataToInsert.id || null,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        created_by: 1 // Default to admin user or system
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }
    
    // Convert the data object to SQL format
    const columns = Object.keys(insertData).join(', ');
    const placeholders = Object.keys(insertData).map(() => '?').join(', ');
    const values = Object.values(insertData);
    
    // Create the INSERT query
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    
    // Execute the query
    const result = await executeQuery(query, values);
    
    // Extract the insert ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertId = (result as any)?.insertId;
    
    return NextResponse.json({
      success: true,
      id: insertId,
      message: 'Event created successfully'
    });
    
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: (error as Error).message },
      { status: 500 }
    );
  }
}
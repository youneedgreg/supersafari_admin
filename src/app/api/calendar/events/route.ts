// app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    const { type, ...dataToInsert } = eventData;

    let table: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let insertData: Record<string, any>;

    if (type === 'arrival' || type === 'departure') {
      table = 'sgftw_reservation_submissions';

      insertData = {
        id: dataToInsert.id,
        name: dataToInsert.name || null,
        arrival_date: type === 'arrival' ? dataToInsert.arrival_date : null,
        departure_date:
          type === 'departure'
            ? dataToInsert.departure_date
            : dataToInsert.departure_date || null,
        status: dataToInsert.status || 'planning',
        adults: dataToInsert.adults || dataToInsert.guests || 1,
        children: dataToInsert.children || 0,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      // If name is not given, fetch from DB using ID
      if (!insertData.name && insertData.id) {
        const clientQuery =
          'SELECT name FROM sgftw_reservation_submissions WHERE id = ?';
        const clientResult = (await executeQuery(
          clientQuery,
          [insertData.id]
        )) as RowDataPacket[];

        if (clientResult.length > 0) {
          insertData.name = clientResult[0].name;
        }
      }
    } else if (type === 'task') {
      table = 'sgftw_tasks';

      insertData = {
        title: dataToInsert.title,
        description: dataToInsert.description || '',
        due_date: dataToInsert.due_date,
        priority: dataToInsert.priority || 'medium',
        status: dataToInsert.status || 'pending',
        id: dataToInsert.id || null,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        created_by: 1
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    const columns = Object.keys(insertData).join(', ');
    const placeholders = Object.keys(insertData)
      .map(() => '?')
      .join(', ');
    const values = Object.values(insertData);

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await executeQuery(query, values);

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

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { logActivity } from '@/lib/logger';

interface EventData {
  type: 'arrival' | 'departure' | 'task';
  name?: string;
  title?: string;
  description?: string;
  arrival_date?: string;
  departure_date?: string;
  due_date?: string;
  status?: string;
  priority?: string;
  adults?: number;
  children?: number;
  guests?: number;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventData = await request.json() as EventData;
    const { type, ...dataToUpdate } = eventData;

    let table: string;
    let updateData: Record<string, string | number | null>;

    if (type === 'arrival' || type === 'departure') {
      table = 'sgftw_reservation_submissions';
      updateData = {
        name: dataToUpdate.name || null,
        arrival_date: type === 'arrival' ? (dataToUpdate.arrival_date || null) : null,
        departure_date: type === 'departure' ? (dataToUpdate.departure_date || null) : null,
        status: dataToUpdate.status || 'planning',
        adults: dataToUpdate.adults || dataToUpdate.guests || 1,
        children: dataToUpdate.children || 0
      };
    } else if (type === 'task') {
      table = 'sgftw_tasks';
      updateData = {
        title: dataToUpdate.title || '',
        description: dataToUpdate.description || '',
        due_date: dataToUpdate.due_date || '',
        priority: dataToUpdate.priority || 'medium',
        status: dataToUpdate.status || 'pending'
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    const setClause = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updateData), params.id];

    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    await executeQuery(query, values);

    // Log the activity
    await logActivity({
      actionType: 'UPDATE',
      actionDescription: `Updated ${type} event: ${type === 'task' ? updateData.title : updateData.name}`,
      entityType: type.toUpperCase(),
      entityId: parseInt(params.id),
      request
    });

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { type } = await request.json() as { type: 'arrival' | 'departure' | 'task' };

    let table: string;
    if (type === 'arrival' || type === 'departure') {
      table = 'sgftw_reservation_submissions';
    } else if (type === 'task') {
      table = 'sgftw_tasks';
    } else {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Get event details before deletion for logging
    const getEventQuery = `SELECT ${type === 'task' ? 'title' : 'name'} as name FROM ${table} WHERE id = ?`;
    const eventResult = (await executeQuery(getEventQuery, [params.id])) as RowDataPacket[];
    const eventName = eventResult[0]?.name;

    const query = `DELETE FROM ${table} WHERE id = ?`;
    await executeQuery(query, [params.id]);

    // Log the activity
    await logActivity({
      actionType: 'DELETE',
      actionDescription: `Deleted ${type} event: ${eventName}`,
      entityType: type.toUpperCase(),
      entityId: parseInt(params.id),
      request
    });

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event', details: (error as Error).message },
      { status: 500 }
    );
  }
} 
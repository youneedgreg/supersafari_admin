// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { formatDistanceToNow } from 'date-fns';
import { logActivity } from '@/lib/logger';

// Define the interfaces
interface NotificationRow extends RowDataPacket {
  id: number;
  title: string;
  message: string;
  created_at: string;
  type: string;
  read: number;
  client_id: number | null;
  client_name: string | null;
}

interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  type: string;
  read: boolean;
  clientId: number | null;
  clientName: string | null;
}

interface NotificationRequest {
  id?: number;
  read?: boolean;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Query to get all notifications
    const query = `
      SELECT 
        n.id,
        n.title,
        n.message,
        n.created_at,
        n.type,
        n.read,
        n.client_id,
        CASE 
          WHEN n.client_id IS NOT NULL THEN c.name
          ELSE NULL
        END as client_name
      FROM 
        sgftw_notifications 
      LEFT JOIN 
        sgftw_reservation_submissions c ON n.client_id = c.id
      ORDER BY 
        n.created_at DESC
    `;

    // Use the executeQuery function
    const rows = await executeQuery(query) as NotificationRow[];

    // Format timestamps to be more user-friendly
    const formattedResults: NotificationResponse[] = rows.map(row => ({
      id: Number(row.id),
      title: row.title,
      message: row.message,
      timestamp: formatDistanceToNow(new Date(row.created_at), { addSuffix: true }),
      type: row.type,
      read: row.read === 1,
      clientId: row.client_id ? Number(row.client_id) : null,
      clientName: row.client_name
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notification as read/unread
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: NotificationRequest = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // If read status is not provided, we can't update
    if (body.read === undefined) {
      return NextResponse.json(
        { error: 'Read status is required' },
        { status: 400 }
      );
    }

    // Get notification details before update
    const notification = await executeQuery(
      'SELECT title FROM sgftw_notifications WHERE id = ?',
      [body.id]
    ) as RowDataPacket[];

    if (notification.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const query = `
      UPDATE sgftw_notifications
      SET \`read\` = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await executeQuery(query, [body.read ? 1 : 0, body.id]);

    // Log the activity
    await logActivity({
      actionType: 'UPDATE',
      actionDescription: `Marked notification as ${body.read ? 'read' : 'unread'}: ${notification[0].title}`,
      entityType: 'NOTIFICATION',
      entityId: body.id,
      request
    });

    return NextResponse.json({ 
      message: `Notification marked as ${body.read ? 'read' : 'unread'}` 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// Mark all notifications as read
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const query = `
      UPDATE sgftw_notifications
      SET \`read\` = 1, updated_at = NOW()
      WHERE \`read\` = 0
    `;

    await executeQuery(query);

    // Log the activity
    await logActivity({
      actionType: 'UPDATE',
      actionDescription: 'Marked all notifications as read',
      entityType: 'NOTIFICATION',
      request
    });

    return NextResponse.json({ 
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

// Delete a notification
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Get notification details before deletion
    const notification = await executeQuery(
      'SELECT title FROM sgftw_notifications WHERE id = ?',
      [id]
    ) as RowDataPacket[];

    if (notification.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const query = 'DELETE FROM sgftw_notifications WHERE id = ?';
    await executeQuery(query, [id]);

    // Log the activity
    await logActivity({
      actionType: 'DELETE',
      actionDescription: `Deleted notification: ${notification[0].title}`,
      entityType: 'NOTIFICATION',
      entityId: Number(id),
      request
    });

    return NextResponse.json({ 
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
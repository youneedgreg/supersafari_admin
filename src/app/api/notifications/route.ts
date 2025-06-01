// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { formatDistanceToNow } from 'date-fns';
import { logActivity } from '@/lib/logger';
import { db } from '@/lib/db';
import { Notification } from '@/lib/db/schema';

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

// GET /api/notifications
export async function GET(): Promise<NextResponse> {
  try {
    const notifications = await db.all<Notification[]>(`
      SELECT 
        id,
        type,
        title,
        message,
        entity_id as entityId,
        entity_type as entityType,
        read,
        created_at as createdAt,
        updated_at as updatedAt
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 100
    `);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const { id, read } = await request.json();

    if (!id || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    await db.run(
      'UPDATE notifications SET read = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [read, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    await db.run('DELETE FROM notifications WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
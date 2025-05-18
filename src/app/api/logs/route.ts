import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    // Get auth token from cookies
    const token = cookies().get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ 
        status: 'ERROR',
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET) as { role: string };
    
    // Only admin can view logs
    if (decoded.role !== 'admin') {
      return NextResponse.json({ 
        status: 'ERROR',
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    // Fetch all logs (both login and activity logs) with user information
    const logs = await executeQuery(`
      SELECT 
        l.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM (
        SELECT 
          id,
          user_id,
          'login' as log_type,
          NULL as action_type,
          NULL as action_description,
          NULL as entity_type,
          NULL as entity_id,
          login_time as timestamp,
          ip_address,
          user_agent
        FROM login_logs
        UNION ALL
        SELECT 
          id,
          user_id,
          'activity' as log_type,
          action_type,
          action_description,
          entity_type,
          entity_id,
          created_at as timestamp,
          ip_address,
          user_agent
        FROM activity_logs
      ) l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.timestamp DESC
      LIMIT 100
    `);

    // Format the response
    const formattedLogs = (logs as any[]).map(log => ({
      id: log.id,
      user_id: log.user_id,
      action_type: log.action_type,
      action_description: log.action_description,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      login_time: log.log_type === 'login' ? log.timestamp : null,
      created_at: log.log_type === 'activity' ? log.timestamp : null,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      user: {
        name: log.user_name,
        email: log.user_email,
        role: log.user_role
      }
    }));

    return NextResponse.json({ 
      status: 'OK',
      logs: formattedLogs
    });
  } catch (error: any) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ 
      status: 'ERROR',
      message: 'Failed to fetch logs',
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Get auth token from cookies
    const token = cookies().get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ 
        status: 'ERROR',
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET) as { role: string };
    
    // Only admin can delete logs
    if (decoded.role !== 'admin') {
      return NextResponse.json({ 
        status: 'ERROR',
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'activity'; // Default to activity logs

    if (!id) {
      return NextResponse.json({ 
        status: 'ERROR',
        message: 'Log ID is required' 
      }, { status: 400 });
    }

    // Delete the log based on type
    const table = type === 'login' ? 'login_logs' : 'activity_logs';
    await executeQuery(`DELETE FROM ${table} WHERE id = ?`, [id]);

    return NextResponse.json({ 
      status: 'OK',
      message: 'Log deleted successfully'
    });
  } catch (error: any) {
    console.error('Failed to delete log:', error);
    return NextResponse.json({ 
      status: 'ERROR',
      message: 'Failed to delete log',
      error: error.message 
    }, { status: 500 });
  }
} 
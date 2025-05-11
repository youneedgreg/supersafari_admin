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

    // Fetch logs with user information
    const logs = await executeQuery(`
      SELECT 
        l.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM login_logs l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.login_time DESC
      LIMIT 100
    `);

    // Format the response
    const formattedLogs = (logs as any[]).map(log => ({
      id: log.id,
      user_id: log.user_id,
      login_time: log.login_time,
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
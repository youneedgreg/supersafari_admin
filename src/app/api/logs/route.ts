import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

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

    // Create activity_logs table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        action_description TEXT,
        entity_type VARCHAR(50),
        entity_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;
    await executeQuery(createTableQuery);

    // Query to get all logs (both login and activity logs) with nested user object
    const query = `
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
    `;

    const logs = await executeQuery(query);

    return NextResponse.json({
      status: 'OK',
      logs
    });
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to fetch logs',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

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

    if (!id) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Log ID is required'
      }, { status: 400 });
    }

    // Fix: First determine which log type to delete
    const checkQuery = `SELECT 'login' as source FROM login_logs WHERE id = ?
                        UNION
                        SELECT 'activity' as source FROM activity_logs WHERE id = ?
                        LIMIT 1`;
    const sourceResult = await executeQuery(checkQuery, [id, id]) as any[];
    
    if (!sourceResult || sourceResult.length === 0) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Log not found'
      }, { status: 404 });
    }
    
    const table = sourceResult[0].source === 'login' ? 'login_logs' : 'activity_logs';
    const deleteQuery = `DELETE FROM ${table} WHERE id = ?`;
    await executeQuery(deleteQuery, [id]);

    return NextResponse.json({
      status: 'OK',
      message: 'Log deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete log:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to delete log',
      error: (error as Error).message
    }, { status: 500 });
  }
}
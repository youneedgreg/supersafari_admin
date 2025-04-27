import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    const pool = await connectDB();
    
    // Try to get a connection from the pool to verify connectivity
    const connection = await pool.getConnection();
    
    // Log information about the connection
    const connectionInfo = {
      threadId: connection.threadId,
      connected: true,
      config: {
        host: connection.config.host,
        port: connection.config.port,
        database: connection.config.database,
        user: connection.config.user,
        // Mask password for security
        // ssl: connection.config.ssl ? true : false
      }
    };
    
    // Test a simple query
    const [result] = await connection.query('SELECT 1 as test');
    
    // Release the connection back to the pool
    connection.release();
    
    return NextResponse.json({
      status: 'OK',
      message: 'Database connection successful',
      connectionInfo,
      testQuery: result
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        errno: error.errno
      }
    }, { status: 500 });
  }
}
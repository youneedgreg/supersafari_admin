// app/api/test-db/route.ts
import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const connection = await connectDB();
    
    const [rows] = await connection.query('SHOW TABLES');

    await connection.end();

    return NextResponse.json({ success: true, tables: rows });
  } catch (error) {
    console.error('DB Connection Error:', error);
    return NextResponse.json({ success: false, message: 'Database connection failed', error });
  }
}

import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    // Get auth token from cookies - with await added
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Unauthorized'
      }, { status: 401 });
    }
    
    // Verify token
    const decoded = verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };
    
    return NextResponse.json({
      status: 'OK',
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Unauthorized',
      error: error.message
    }, { status: 401 });
  }
}
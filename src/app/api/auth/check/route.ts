import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';

// Use the same secret key format
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function GET() {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    console.log('Auth check - Cookie store:', await cookieStore.getAll());
    console.log('Auth check - Token present:', !!token);
    
    if (!token) {
      console.log('Auth check - No token found in cookies');
      return NextResponse.json({
        status: 'ERROR',
        message: 'No authentication token found',
        details: 'The auth_token cookie is missing'
      }, { status: 401 });
    }
    
    // Verify token
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      const decoded = payload as {
        userId: number;
        email: string;
        role: string;
      };
      
      console.log('Auth check - Token verified successfully:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
      
      return NextResponse.json({
        status: 'OK',
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (verifyError) {
      console.error('Auth check - Token verification failed:', verifyError);
      return NextResponse.json({
        status: 'ERROR',
        message: 'Invalid authentication token',
        details: verifyError instanceof Error ? verifyError.message : 'Token verification failed'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth check - Unexpected error:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Authentication check failed',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 401 });
  }
}
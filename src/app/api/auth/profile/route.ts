import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { cookies } from 'next/headers';
import * as jose from 'jose';

// Use the same secret key format as middleware
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function PUT(request: Request) {
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
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Name and email are required'
      }, { status: 400 });
    }

    // Update user profile
    await executeQuery(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    return NextResponse.json({
      status: 'OK',
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
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
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    // Get user profile
    const users = await executeQuery(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'OK',
      user: users[0]
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
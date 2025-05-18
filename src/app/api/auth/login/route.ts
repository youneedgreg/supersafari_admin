import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

// Use the same secret key format as middleware
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Email and password are required'
      }, {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get user from database
    const users = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as any[];
    
    console.log('User found in database:', users.length > 0);

    if (users.length === 0) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Invalid credentials'
      }, {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation:', isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Invalid credentials'
      }, {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create JWT token with jose
    const token = await new jose.SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(JWT_SECRET);
    
    console.log('JWT token created successfully');

    // Log the login
    await executeQuery(
      'INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [user.id, request.headers.get('x-forwarded-for') || 'unknown', request.headers.get('user-agent') || 'unknown']
    );
    
    console.log('Login logged to database');

    // Create the response
    const response = NextResponse.json({
      status: 'OK',
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Set cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: '/'
    });
    
    console.log('Auth cookie set in response');
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
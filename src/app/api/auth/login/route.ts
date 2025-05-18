import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
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

    // Create JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('JWT token created successfully');

    // Log the login
    await executeQuery(
      'INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [user.id, request.headers.get('x-forwarded-for') || 'unknown', request.headers.get('user-agent') || 'unknown']
    );
    
    console.log('Login logged to database');

    // Create the response with the proper cookie
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

    // Set cookie with more straightforward approach
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
    
    // Log all cookies in the response
    console.log('Response cookies:', response.cookies);
    
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
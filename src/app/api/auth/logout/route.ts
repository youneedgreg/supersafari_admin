import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Get the cookie store
    const cookieStore = cookies();
    
    // Delete the auth cookie
    cookieStore.delete('auth_token');
    
    return NextResponse.json({
      status: 'OK',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to logout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      status: 'OK',
      message: 'Logged out successfully'
    });

    // Delete the auth cookie
    response.cookies.delete('auth_token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to logout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
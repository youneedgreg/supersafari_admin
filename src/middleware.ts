import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Add paths that don't require authentication
const publicPaths = ['/login', '/api/auth/login', '/api/auth/setup']
const publicApiPaths = ['/api/auth/login', '/api/auth/setup', '/api/auth/check']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('Middleware - Processing path:', pathname);
  console.log('Middleware - Cookies present:', request.cookies.getAll());
  
  // Allow all public API paths without authentication checks
  if (publicApiPaths.includes(pathname)) {
    console.log('Middleware - Public API path, allowing through');
    return NextResponse.next()
  }
  
  // Allow public paths
  if (publicPaths.includes(pathname)) {
    // If user is already logged in and tries to access login page, redirect to home
    if (pathname === '/login') {
      const token = request.cookies.get('auth_token')
      console.log('Middleware - Login page, token present:', !!token);
      
      if (token) {
        try {
          verify(token.value, JWT_SECRET)
          console.log('Middleware - Valid token on login page, redirecting to home');
          return NextResponse.redirect(new URL('/', request.url))
        } catch (error) {
          // Invalid token, clear it and stay on login page
          console.log('Middleware - Invalid token on login page:', error);
          const response = NextResponse.next()
          response.cookies.delete('auth_token')
          return response
        }
      }
    }
    console.log('Middleware - Public path, allowing through');
    return NextResponse.next()
  }
  
  // Check for authentication token
  const token = request.cookies.get('auth_token')
  console.log('Middleware - Protected path, token present:', !!token);
  
  // For API routes, return JSON response
  if (pathname.startsWith('/api/')) {
    if (!token) {
      console.log('Middleware - API route with no token, returning 401');
      return NextResponse.json(
        { status: 'ERROR', message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    try {
      // Verify token
      const decoded = verify(token.value, JWT_SECRET) as { role: string }
      console.log('Middleware - API route, token verified');
      
      // Check for admin-only routes
      if (pathname.startsWith('/api/logs') && decoded.role !== 'admin') {
        console.log('Middleware - Admin-only API route, access denied');
        return NextResponse.json(
          { status: 'ERROR', message: 'Forbidden' },
          { status: 403 }
        )
      }
      
      return NextResponse.next()
    } catch (error) {
      console.log('Middleware - API route, invalid token:', error);
      return NextResponse.json(
        { status: 'ERROR', message: 'Invalid token' },
        { status: 401 }
      )
    }
  }
  
  // For non-API routes, redirect to login
  if (!token) {
    console.log('Middleware - Protected page with no token, redirecting to login');
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  
  try {
    // Verify token
    const decoded = verify(token.value, JWT_SECRET) as { role: string }
    console.log('Middleware - Protected page, token verified');
    
    // Check for admin-only routes
    if (pathname.startsWith('/logs') && decoded.role !== 'admin') {
      console.log('Middleware - Admin-only page, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    // Clear invalid token and redirect to login
    console.log('Middleware - Protected page, invalid token:', error);
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
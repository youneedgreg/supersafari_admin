import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Add paths that don't require authentication
const publicPaths = ['/login', '/api/auth/login', '/api/auth/setup']
const publicApiPaths = ['/api/auth/login', '/api/auth/setup', '/api/auth/check']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow all public API paths without authentication checks
  if (publicApiPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    // If user is already logged in and tries to access login page, redirect to home
    if (pathname === '/login') {
      const token = request.cookies.get('auth_token')
      if (token) {
        try {
          verify(token.value, JWT_SECRET)
          return NextResponse.redirect(new URL('/', request.url))
        } catch {
          // Invalid token, clear it and stay on login page
          const response = NextResponse.next()
          response.cookies.delete('auth_token')
          return response
        }
      }
    }
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('auth_token')
  
  // For API routes, return JSON response
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { status: 'ERROR', message: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    try {
      // Verify token
      const decoded = verify(token.value, JWT_SECRET) as { role: string }
      
      // Check for admin-only routes
      if (pathname.startsWith('/api/logs') && decoded.role !== 'admin') {
        return NextResponse.json(
          { status: 'ERROR', message: 'Forbidden' }, 
          { status: 403 }
        )
      }
      
      return NextResponse.next()
    } catch {
      return NextResponse.json(
        { status: 'ERROR', message: 'Invalid token' }, 
        { status: 401 }
      )
    }
  }
  
  // For non-API routes, redirect to login
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  try {
    // Verify token
    const decoded = verify(token.value, JWT_SECRET) as { role: string }
    
    // Check for admin-only routes
    if (pathname.startsWith('/logs') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  } catch {
    // Clear invalid token and redirect to login
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
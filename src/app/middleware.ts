import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Grab the auth cookie set by your Node.js backend.
  // IMPORTANT: Replace 'token' with the actual name of your cookie (e.g., 'connect.sid', 'access_token', 'session')
  const token = request.cookies.get('token')?.value; 
  const { pathname } = request.nextUrl;

  // 1. Define Route Categories
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isProtectedRoute = pathname.startsWith('/classroom') || pathname === '/payment-success' || pathname === '/profile' || pathname === '/invoices';
  const isAdminRoute = pathname.startsWith('/dashboard');

  // 2. Logged-in users should NOT see Login/Register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Logged-out users should NOT see Protected or Admin routes
  if ((isProtectedRoute || isAdminRoute) && !token) {
    // Optional: You can append a ?callbackUrl to redirect them back after they log in
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Let them pass if all checks look good
  return NextResponse.next();
}

// 5. Tell Next.js exactly which routes this middleware should run on to save performance
export const config = {
  matcher: [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/classroom/:path*', 
    '/payment-success', 
    '/profile',
    '/invoices',
    '/dashboard/:path*'
  ]
};
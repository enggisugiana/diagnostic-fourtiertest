import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-later';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes
  const isFilteredAttemptGet = pathname === '/api/attempts' && 
    request.method === 'GET' && 
    (request.nextUrl.searchParams.has('studentNik') || request.nextUrl.searchParams.has('sessionKey'));

  const isPublicApiRoute = 
    pathname === '/api/auth/login' || 
    (pathname === '/api/attempts' && request.method === 'POST') ||
    isFilteredAttemptGet ||
    (pathname === '/api/questions' && request.method === 'GET') ||
    (pathname === '/api/sessions' && request.method === 'GET') ||
    (pathname === '/api/rules' && request.method === 'GET');

  // Only check /api routes
  if (pathname.startsWith('/api') && !isPublicApiRoute) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader && (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      console.log('MIDDLEWARE DENIED (401): No token for path', pathname);
      return NextResponse.json({ success: false, message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jose.jwtVerify(token, secret);
    } catch (error: any) {
      console.log('MIDDLEWARE DENIED (403): Token invalid for path', pathname, error.message);
      return NextResponse.json({ success: false, message: 'Forbidden: Invalid token', error: error.message }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

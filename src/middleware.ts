import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access a protected route
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    // Add routes that require authentication
    '/documents/:path*',
    '/profile/:path*',
    // Add more protected routes as needed
  ],
};

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Skip middleware for static files and api routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api/')
  ) {
    return res;
  }

  const { data: { session } } = await supabase.auth.getSession();

  // Only handle auth pages
  if (req.nextUrl.pathname.startsWith('/auth/')) {
    if (session) {
      // If user is logged in, redirect away from auth pages
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/documents';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/auth/:path*',
  ],
};

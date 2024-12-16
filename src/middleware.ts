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

  try {
    const { data: { session } } = await supabase.auth.getSession();

    // Public routes - accessible without authentication
    const publicRoutes = ['/auth/login', '/auth/register'];
    if (publicRoutes.includes(req.nextUrl.pathname)) {
      if (session) {
        // If user is logged in, redirect away from auth pages
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = profile?.role === 'admin' ? '/admin' : '/documents';
        return NextResponse.redirect(redirectUrl);
      }
      return res;
    }

    // Protected routes - require authentication
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Admin routes - require admin role
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/documents';
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

export const config = {
  matcher: [
    '/',
    '/documents/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
};

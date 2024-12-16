import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Get session
    const { data: { session } } = await supabase.auth.getSession();

    // If accessing the root path '/', redirect based on auth status and role
    if (req.nextUrl.pathname === '/') {
      if (!session) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        return NextResponse.redirect(redirectUrl);
      }

      // Check user role and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = profile?.role === 'admin' ? '/admin' : '/documents';
      return NextResponse.redirect(redirectUrl);
    }

    // Protect non-auth routes
    if (!session && !req.nextUrl.pathname.startsWith('/auth/')) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    if (session && req.nextUrl.pathname.startsWith('/auth/')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = profile?.role === 'admin' ? '/admin' : '/documents';
      return NextResponse.redirect(redirectUrl);
    }

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        return NextResponse.redirect(redirectUrl);
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/documents';
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of any error, redirect to login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    '/',
    '/documents/:path*',
    '/profile/:path*',
    '/auth/:path*',
    '/admin/:path*'
  ],
};

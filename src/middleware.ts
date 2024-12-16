import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // If the user is not logged in and trying to access a protected route
  if (!session && !req.nextUrl.pathname.startsWith('/auth/')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is logged in and trying to access auth pages
  if (session && req.nextUrl.pathname.startsWith('/auth/')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin access for /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session?.user?.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
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

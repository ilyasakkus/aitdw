import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Public routes kontrolü
  if (req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/auth/')) {
    if (session) {
      // Kullanıcı giriş yapmışsa yönlendir
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      return NextResponse.redirect(new URL(
        profile?.role === 'admin' ? '/admin' : '/documents', 
        req.url
      ));
    }
    return res;
  }

  // Auth gerektiren rotalar için kontrol
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Admin rotaları için özel kontrol
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/documents', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/',  // Root path için matcher ekledik
    '/admin/:path*',
    '/documents/:path*',
    '/auth/login',
    '/auth/register'
  ]
};

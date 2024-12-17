import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Public routes - herkes erişebilir
  const publicRoutes = ['/auth/login', '/auth/register'];
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    if (session) {
      // Zaten giriş yapmış kullanıcıyı documents'a yönlendir
      return NextResponse.redirect(new URL('/documents', req.url));
    }
    return res;
  }

  // Auth kontrolü
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Admin route kontrolü
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
    '/admin/:path*',
    '/documents/:path*',
    '/auth/login',
    '/auth/register'
  ]
};

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!session?.user) {
        throw new Error('No session');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || data?.role !== 'admin') {
        return NextResponse.redirect(new URL('/documents', req.url));
      }
    }

    return res;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*']
};

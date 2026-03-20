import type { SessionData } from '@/lib/session';
import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: 'inomedia_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/teacher')) {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    if (!session.userId || session.role !== 'teacher') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return response;
  }

  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    if (!session.userId || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher/:path*', '/admin/:path*'],
};

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Check if the requested path is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.search = `?callbackUrl=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }

    if (!token.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

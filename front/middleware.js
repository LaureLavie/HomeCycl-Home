import { NextResponse } from 'next/server';

// Protège les pages selon le rôle, à partir d'un cookie léger (hch_role) posé à la connexion.
// Le JWT réel n'est jamais mis en cookie : il reste en localStorage et part uniquement
// dans le header Authorization des appels API. Ce middleware n'est qu'une première barrière
// UX (évite le flash de contenu protégé) ; la sécurité réelle est assurée par le backend.
const ROLE_PREFIX = {
  ADMIN: '/admin',
  TECHNICIEN: '/technicien',
  CLIENT: '/client',
};

const PROTECTED_PREFIXES = Object.values(ROLE_PREFIX);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) return NextResponse.next();

  const role = request.cookies.get('hch_role')?.value;

  if (!role) {
    const loginUrl = new URL('/connexion', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedPrefix = ROLE_PREFIX[role];
  if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(allowedPrefix || '/connexion', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/technicien/:path*', '/client/:path*'],
};
// middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const PROTECTED_ROUTES = {
  "/admin": ["ADMIN"],
  "/technicien": ["TECHNICIEN", "ADMIN"],
  "/client": ["CLIENT"],
};

export function middleware(req) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Vérifie si la route est protégée
  const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    path.startsWith(route)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  // Récupère le token JWT dans les cookies
  const token = req.cookies.get("hch_token")?.value;

  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET);

    const allowedRoles = PROTECTED_ROUTES[matchedRoute];

    if (!allowedRoles.includes(decoded.role)) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (err) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/technicien/:path*",
    "/client/:path*",
  ],
};

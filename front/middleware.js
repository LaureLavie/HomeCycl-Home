// middleware.ts — Protection des routes par rôle (AUTH-06 côté front)
// Compétence CDA : Sécuriser une application
//
// ⚠️ CORRECTIFS DE SÉCURITÉ apportés par rapport à l'ancienne version :
//
// 1. Le secret de signature JWT était lu depuis `NEXT_PUBLIC_JWT_SECRET`.
//    Tout préfixe NEXT_PUBLIC_ est injecté par Next.js dans le bundle
//    JavaScript envoyé au navigateur (visible dans les DevTools → Sources).
//    Un attaquant pouvait donc récupérer le secret et forger un token
//    { role: "ADMIN" } valide. Le middleware s'exécute côté serveur
//    (Edge Runtime) : il n'a JAMAIS besoin d'une variable NEXT_PUBLIC_.
//    → Utiliser `JWT_SECRET`, strictement identique à celui du back
//      (back/.env : JWT_SECRET=...), et ne JAMAIS le préfixer NEXT_PUBLIC_.
//
// 2. La librairie `jsonwebtoken` dépend du module Node `crypto`, qui n'est
//    pas disponible dans l'Edge Runtime utilisé par défaut par le
//    middleware Next.js (erreur silencieuse ou "Module not found: crypto"
//    au build). `jose` est une implémentation JWT en Web Crypto API,
//    donc compatible Edge. Installer avec :
//      npm install jose

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";


const PROTECTED_ROUTES = {
  "/admin": ["ADMIN"],
  "/technicien": ["TECHNICIEN", "ADMIN"],
  "/client": ["CLIENT"],
};

// Encodé une seule fois au chargement du module (pas à chaque requête)
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    path.startsWith(route)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get("hch_token")?.value;

  if (!token) {
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role;

    const allowedRoles = PROTECTED_ROUTES[matchedRoute];

    if (!role || typeof role !== "string" || !allowedRoles.includes(role)) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // Signature invalide, token expiré, ou secret incorrect
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/technicien/:path*", "/client/:path*"],
};
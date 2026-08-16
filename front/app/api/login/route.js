// front/app/api/login/route.js
// Route Handler serveur : seul point de contact avec le JWT.
// Compétence CDA visée : Développer des composants métier — Sécurité applicative
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Requête invalide" },
      { status: 400 }
    );
  }

  let backendRes;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Service d'authentification indisponible" },
      { status: 502 }
    );
  }

  const result = await backendRes.json();

  if (!backendRes.ok || !result.success) {
    return NextResponse.json(
      { success: false, message: result.message || "Email ou mot de passe incorrect" },
      { status: backendRes.status }
    );
  }

  const { token, user } = result.data;

  // Réponse au client : jamais le token, uniquement les infos d'affichage
  const response = NextResponse.json({
    success: true,
    user,
    redirect: result.redirect,
  });

  // Le token vit UNIQUEMENT dans un cookie httpOnly : inaccessible en JS (protection XSS)
  response.cookies.set("hch_token", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24h — aligné avec JWT_EXPIRES_IN côté backend
  });

  return response;
}
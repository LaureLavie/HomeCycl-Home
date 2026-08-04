// front/app/api/signup/route.js
// Route Handler serveur : relaie l'inscription vers Express et pose le cookie JWT.
// Compétence CDA : Développer des composants métier — Sécurité applicative (BFF)
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

  // Le formulaire public ne crée que des comptes CLIENT (les rôles
  // ADMIN/TECHNICIEN sont créés par un admin via /api/users)
  const payload = { ...body, role: "CLIENT" };

  let backendRes;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/inscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Service d'inscription indisponible" },
      { status: 502 }
    );
  }

  const result = await backendRes.json();

  if (!backendRes.ok || !result.success) {
    return NextResponse.json(
      {
        success: false,
        message: result.message || "Erreur lors de la création du compte",
        errors: result.errors,
      },
      { status: backendRes.status }
    );
  }

  const { token, user } = result.data;

  const response = NextResponse.json({
    success: true,
    user,
    redirect: "/client/dashboard",
  });

  // Connexion automatique après inscription (AUTH-08) : même cookie que /api/login
  response.cookies.set("hch_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
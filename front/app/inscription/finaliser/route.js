// front/app/api/inscription/finaliser/route.js
// BFF : relaie la finalisation d'inscription post-réservation vers Express
// et pose le cookie JWT httpOnly (même pattern que /api/login).
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
    backendRes = await fetch(`${BACKEND_URL}/api/auth/inscription/finaliser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  const { token, user, redirect } = result.data;

  const response = NextResponse.json({ success: true, data: { user, redirect } });

  response.cookies.set("hch_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
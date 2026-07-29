// front/app/api/logout/route.js
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(request) {
  const token = request.cookies.get("hch_token")?.value;

  // Invalide le token côté backend (blacklist) avant de le supprimer côté client
  if (token) {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {}); // best effort, on nettoie le cookie même si ça échoue
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("hch_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
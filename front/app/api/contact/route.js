// front/app/api/contact/route.js
// Relais BFF — route publique, pas de cookie à lire/poser.
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
    backendRes = await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Service indisponible, réessayez plus tard" },
      { status: 502 }
    );
  }

  const result = await backendRes.json();

  return NextResponse.json(result, { status: backendRes.status });
}
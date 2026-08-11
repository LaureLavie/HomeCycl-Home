// front/app/api/client/creneaux/route.js
// BFF : relaie la recherche de créneaux vers le catalogue public du backend.
// Lecture seule, fonctionne connecté ou anonyme (apiFetch attache le token
// s'il existe, sans que ce soit requis côté back — route publique).
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiFetch";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  try {
    const result = await apiFetch(`/api/public/creneaux?${searchParams.toString()}`);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
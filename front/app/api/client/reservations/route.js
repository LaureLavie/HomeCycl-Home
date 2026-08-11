// front/app/api/client/reservations/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiFetch";

// Fonctionne connecté (id_client injecté par le back) OU anonyme
export async function POST(request) {
  const body = await request.json();
  try {
    const result = await apiFetch("/api/reservations", { method: "POST", body: JSON.stringify(body) });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message, errors: err.errors },
      { status: err.statusCode || 500 }
    );
  }
}
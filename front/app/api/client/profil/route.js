// front/app/api/client/profil/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiFetch";

export async function PUT(request) {
  const body = await request.json();
  try {
    const result = await apiFetch("/api/client/profil", { method: "PUT", body: JSON.stringify(body) });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message, errors: err.errors },
      { status: err.statusCode || 500 }
    );
  }
}
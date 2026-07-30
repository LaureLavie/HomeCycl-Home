// front/app/api/client/velos/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "../../../lib/apiFetch";

export async function POST(request) {
  const body = await request.json();
  try {
    const result = await apiFetch("/api/client/velos", { method: "POST", body: JSON.stringify(body) });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message, errors: err.errors },
      { status: err.statusCode || 500 }
    );
  }
}
// front/app/api/technicien/interventions/[id]/annuler/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiFetch";

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const result = await apiFetch(`/api/technicien/interventions/${id}/annuler`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
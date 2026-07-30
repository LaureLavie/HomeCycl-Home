// front/app/api/technicien/interventions/[id]/terminer/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiFetch";

export async function POST(request, { params }) {
  const { id } = await params;
  try {
    const result = await apiFetch(`/api/technicien/interventions/${id}/terminer`, { method: "POST" });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
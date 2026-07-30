// front/app/api/technicien/clients/[id]/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiFetch";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const result = await apiFetch(`/api/technicien/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message, errors: err.errors },
      { status: err.statusCode || 500 }
    );
  }
}
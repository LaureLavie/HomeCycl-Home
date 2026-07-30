// front/app/api/admin/forfaits/[id]/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiFetch";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const result = await apiFetch(`/api/forfait/${id}`, { method: "PUT", body: JSON.stringify(body) });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message, errors: err.errors },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const result = await apiFetch(`/api/forfait/${id}`, { method: "DELETE" });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
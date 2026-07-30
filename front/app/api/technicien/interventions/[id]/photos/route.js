// front/app/api/technicien/interventions/[id]/photos/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiFetch";

// Relais multipart : on transmet le FormData reçu du client tel quel au back,
// qui le traitera avec Multer (upload.array('photos', 5)).
export async function POST(request, { params }) {
  const { id } = await params;
  const formData = await request.formData();

  try {
    const result = await apiFetch(`/api/technicien/interventions/${id}/photos`, {
      method: "POST",
      body: formData,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
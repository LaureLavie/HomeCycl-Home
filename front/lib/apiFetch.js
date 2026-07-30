// front/lib/apiFetch.js
"use server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const token = (await cookies()).get("hch_token")?.value;
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      // Pour FormData : on laisse fetch fixer le Content-Type (avec boundary)
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const result = await res.json();

  if (!res.ok || result.success === false) {
    const error = new Error(result.message || "Erreur API");
    error.statusCode = res.status;
    error.errors = result.errors;
    throw error;
  }

  return result;
}
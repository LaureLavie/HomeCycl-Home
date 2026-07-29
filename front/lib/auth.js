// front/lib/auth.js
"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Utilisable UNIQUEMENT dans un Server Component / Route Handler / Server Action
export async function getCurrentUser() {
  const token = (await cookies()).get("hch_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
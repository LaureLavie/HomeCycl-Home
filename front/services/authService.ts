// Service d'appel à l'API d'authentification du backend Express.
// Compétence CDA : Développer la partie front-end d'une application —
// consommation d'une API REST sécurisée (JWT).

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type Role = "ADMIN" | "TECHNICIEN" | "CLIENT";

export type LoginSuccess = {
  success: true;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      role: Role;
      nom: string | null;
      prenom: string | null;
    };
  };
  redirect: string;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
};

/**
 * Appelle POST /api/auth/login.
 * Lance une erreur avec un message exploitable en cas d'échec
 * (email/mot de passe invalide, compte désactivé, erreur serveur…).
 */
export async function loginUser(
  email: string,
  mot_passe: string
): Promise<LoginSuccess> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, mot_passe }),
  });

  const payload: LoginSuccess | ApiError = await res.json();

  if (!res.ok || !payload.success) {
    const message =
      (payload as ApiError).errors?.[0]?.message ??
      payload.message ??
      "Impossible de vous connecter pour le moment.";
    throw new Error(message);
  }

  return payload;
}
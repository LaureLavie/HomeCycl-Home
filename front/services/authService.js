// front/services/authService.js
// Le client ne parle QU'à nos propres Route Handlers, jamais directement au backend Express
// (BFF : le JWT ne transite jamais côté navigateur, cf. front/lib/auth.js)

export async function loginUser(email, mot_passe) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, mot_passe }),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || "Erreur de connexion");
  }

  return result; // { success, user, redirect }
}

export async function logoutUser() {
  await fetch("/api/logout", { method: "POST" });
}

// ─────────────────────────────────────────────
// US-02 : Inscription (compte CLIENT)
// ─────────────────────────────────────────────
export async function signupUser(data) {
  const res = await fetch("/api/inscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    // Propage les erreurs de validation champ par champ si présentes
    const error = new Error(result.message || "Erreur lors de la création du compte");
    error.errors = result.errors;
    throw error;
  }

  return result; // { success, user, redirect }
}

// ─────────────────────────────────────────────
// AUTH-09 : Mot de passe oublié
// ─────────────────────────────────────────────
export async function forgotPassword(email) {
  const res = await fetch("/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || "Une erreur est survenue");
  }

  return result; // { success, message }
}

// ─────────────────────────────────────────────
// AUTH-10 : Réinitialisation du mot de passe (avec token du lien reçu)
// ─────────────────────────────────────────────
export async function resetPassword(token, mot_passe) {
  const res = await fetch("/api/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, mot_passe }),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || "Impossible de réinitialiser le mot de passe");
  }

  return result; // { success, message }
}
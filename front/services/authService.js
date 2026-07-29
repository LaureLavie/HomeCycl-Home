// front/services/auth.js
// Le client ne parle QU'à nos propres Route Handlers, jamais directement au backend Express
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
// front/services/contactService.js
export async function envoyerMessageContact(data) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    const error = new Error(result.message || "Erreur lors de l'envoi du message");
    error.errors = result.errors;
    throw error;
  }

  return result; // { success, message, data }
}
// front/services/reservationService.js
// Le tunnel de réservation lit le catalogue directement sur le backend Express
// (données publiques, pas de JWT en jeu) et n'utilise le BFF que pour l'écriture
// (POST réservation), conformément au pattern BFF du projet : lecture via
// Server Components / fetch direct, écriture via Route Handler Next.js.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function getJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  const result = await res.json();
  if (!res.ok || !result.success) {
    throw new Error(result.message || "Erreur lors du chargement des données");
  }
  return result.data;
}

// US-08 : Forfaits actifs, éventuellement filtrés par type de vélo côté front
export async function getForfaitsPublics() {
  return getJson(`${BACKEND_URL}/api/public/forfaits`);
}

// US-09 : Produits additionnels actifs
export async function getProduitsPublics() {
  return getJson(`${BACKEND_URL}/api/public/produits`);
}

// US-10 : Zones géographiques (secteur d'intervention)
export async function getZonesPubliques() {
  return getJson(`${BACKEND_URL}/api/public/zones`);
}

// US-31 : Créneaux disponibles pour un forfait + une zone sur une période
export async function getCreneauxDisponibles({ id_forfait, id_zone, date_debut, date_fin }) {
  const params = new URLSearchParams({ id_forfait, id_zone, date_debut });
  if (date_fin) params.set("date_fin", date_fin);
  return getJson(`${BACKEND_URL}/api/public/creneaux?${params.toString()}`);
}

// US-21 : Création de la réservation (anonyme ou connecté — le BFF gère le JWT)
export async function creerReservation(payload) {
  const res = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    const error = new Error(result.message || "Erreur lors de la réservation");
    error.errors = result.errors;
    throw error;
  }

  return result; // { success, data, redirect?, requiresAccount? }
}

// US-23 : Finalisation du compte après une réservation anonyme
export async function finaliserInscription(payload) {
  const res = await fetch("/api/inscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    const error = new Error(result.message || "Erreur lors de la création du compte");
    error.errors = result.errors;
    throw error;
  }

  return result; // { success, user, redirect }
}
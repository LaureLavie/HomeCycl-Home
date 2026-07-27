// Client HTTP générique pour parler au backend Express.
// Toutes les réponses du backend suivent la forme { success, message, data, errors? }.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors; // [{ field, message }] — renvoyé par Zod côté backend
  }

  /** Regroupe errors[] en { champ: message } pour un affichage inline dans les formulaires */
  fieldErrors() {
    return this.errors.reduce((acc, e) => {
      if (e.field) acc[e.field] = e.message;
      return acc;
    }, {});
  }
}

export async function apiFetch(path, { method = 'GET', body, token, params } = {}) {
  let url = `${API_BASE}${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      'Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.',
      0
    );
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    // Pas de corps JSON (ex : 204)
  }

  if (!response.ok || (json && json.success === false)) {
    throw new ApiError(
      json?.message || 'Une erreur est survenue.',
      response.status,
      json?.errors || []
    );
  }

  return json ?? { success: true };
}
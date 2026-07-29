// Gestion du cookie contenant le JWT côté client.
// Compétence CDA : Sécuriser une application — gestion de session côté front.
//
// Pourquoi un cookie et pas localStorage ?
// `front/middleware.js` protège les routes /admin, /technicien, /client en
// lisant le token depuis les cookies de la requête (Edge Middleware n'a pas
// accès à localStorage, qui n'existe que dans le navigateur après hydratation).
// Le cookie doit donc être lisible par le serveur à chaque navigation.

const TOKEN_COOKIE = "hch_token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h — aligné sur JWT_EXPIRES_IN côté back

export function saveToken(token: string): void {
  if (typeof document === "undefined") return; // sécurité SSR

  const secureFlag = process.env.NODE_ENV === "production" ? "; secure" : "";
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; samesite=strict${secureFlag}`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}
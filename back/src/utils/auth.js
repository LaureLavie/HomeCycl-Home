// AUTH-02 / AUTH-05 / AUTH-09 : Utilitaires sécurité (hash + JWT + reset token)
// Compétence CDA : Développer des composants métier — Sécurité applicative
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12; // Plus sécurisé que 10 pour prod

/**
 * Génère un JWT signé contenant l'id et le rôle de l'utilisateur.
 * Durée : 24h (configurable via env JWT_EXPIRES_IN)
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id_authentification,
      role: user.Role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Hash le mot de passe avec bcrypt (12 rounds)
 * AUTH-02 : Implémentation du hash mot de passe
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare un mot de passe en clair avec son hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Extrait et vérifie un token JWT depuis le header Authorization
 * Retourne le payload décodé ou null si invalide
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// AUTH-09/10 : Token de réinitialisation de mot de passe
//
// Principe (identique au hash de mot de passe) : on ne stocke JAMAIS
// le token brut en base. Seul son hash SHA-256 est persisté.
// → Si la base fuite, un attaquant ne peut pas reconstruire de lien valide.
// Le token brut, lui, n'est envoyé qu'une fois, via le lien de réinitialisation.
// ─────────────────────────────────────────────

/**
 * Génère un token de reset : la version brute (à mettre dans l'URL/email)
 * et sa version hashée (à stocker en base pour comparaison ultérieure).
 */
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

/**
 * Hash un token brut reçu du client (URL) pour le comparer à celui en base.
 */
export const hashResetToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};
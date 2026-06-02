// AUTH-02 / AUTH-05 : Utilitaires sécurité (hash + JWT)
// Compétence CDA : Développer des composants métier — Sécurité applicative
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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
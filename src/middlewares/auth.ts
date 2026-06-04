// AUTH-06 : Middleware d'authentification JWT
// Compétence CDA : Développer des composants métier — Sécurité
import { verifyToken } from '../utils/auth';
import { isTokenBlacklisted } from '../services/authService';

/**
 * Vérifie que le token JWT est présent, valide et non révoqué.
 * Injecte req.user = { id, role } pour les middlewares suivants.
 *
 * Usage : router.get('/route-protegee', auth, controller)
 */
export const auth = (req, res, next) => {
  // Extrait le token du header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: "Accès refusé : token d'authentification manquant",
    });
  }

  const token = authHeader.split(' ')[1];

  // Vérifie si le token a été révoqué (logout)
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: 'Session expirée. Veuillez vous reconnecter.',
    });
  }

  // Vérifie et décode le token
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Token invalide ou expiré',
    });
  }

  // Injecte les infos utilisateur dans la requête
  req.user = decoded;
  // Stocke le token brut pour le logout
  req.token = token;

  next();
};
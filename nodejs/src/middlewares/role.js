// AUTH-06 : Middleware d'autorisation par rôle (RBAC)
// Compétence CDA : Développer des composants métier — Contrôle d'accès

/**
 * Vérifie que l'utilisateur connecté possède un des rôles autorisés.
 * Doit être utilisé APRÈS le middleware auth.
 *
 * Usage : router.get('/admin', auth, authorize(['ADMIN']), controller)
 *         router.get('/staff', auth, authorize(['ADMIN', 'TECHNICIEN']), controller)
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès interdit : rôle '${req.user.role}' non autorisé pour cette ressource`,
      });
    }

    next();
  };
};
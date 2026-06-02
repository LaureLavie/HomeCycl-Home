export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit : vous n'êtes pas authentifié pour ces accès" });
    }
    next();
  };
};

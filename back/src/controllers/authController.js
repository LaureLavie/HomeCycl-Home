// AUTH-01 à AUTH-08 : Contrôleur d'authentification
// Compétence CDA : Développer des composants métier + Interfaces utilisateur (API REST)
import * as authService from '../services/authService.js';
import { signupSchema, loginSchema, updateUserSchema } from '../validators/authValidator.js';

// ─────────────────────────────────────────────
// US-02 : POST /api/auth/signup — Inscription
// AUTH-03 : Formulaire d'inscription + AUTH-04 : Gestion des erreurs
// ─────────────────────────────────────────────

export const signup = async (req, res) => {
  try {
    // Validation des données avec Zod
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      // AUTH-04 : Retourne les erreurs de validation formatées pour le front
      const errors = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors,
      });
    }

    const result = await authService.registerUser(parsed.data);

    // AUTH-08 : Connexion automatique après inscription — retourne le token
    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la création du compte',
    });
  }
};

// ─────────────────────────────────────────────
// US-03 : POST /api/auth/login — Connexion
// AUTH-05 : Génération JWT + AUTH-08 : Redirection post-login
// ─────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors,
      });
    }

    const { email, mot_passe } = parsed.data;
    const result = await authService.loginUser(email, mot_passe);

    // AUTH-08 : Le front utilisera result.user.role pour rediriger vers le bon dashboard
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: result,
      // Hint de redirection selon le rôle (le front décidera)
      redirect: getRedirectByRole(result.user.role),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la connexion',
    });
  }
};

// ─────────────────────────────────────────────
// US-03 : POST /api/auth/logout — Déconnexion
// AUTH-07 : Logout — invalide la session
// ─────────────────────────────────────────────

export const logout = (req, res) => {
  try {
    // Invalide le token en le mettant en blacklist
    if (req.token) {
      authService.logoutUser(req.token);
    }

    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/me — Profil de l'utilisateur connecté
// ─────────────────────────────────────────────

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
    });
  }
};

// ─────────────────────────────────────────────
// ADMIN : GET /api/auth — Liste tous les utilisateurs
// ─────────────────────────────────────────────

export const getAll = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
    });
  }
};

// ─────────────────────────────────────────────
// ADMIN : DELETE /api/auth/:id — Désactive un utilisateur (soft delete)
// ─────────────────────────────────────────────

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await authService.deleteUser(id);
    return res.status(200).json({
      success: true,
      message: 'Utilisateur désactivé avec succès',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression',
    });
  }
};

// ─────────────────────────────────────────────
// ADMIN/TECHNICIEN : PUT /api/auth/:id — Met à jour un utilisateur
// ─────────────────────────────────────────────

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ success: false, message: 'Données invalides', errors });
    }

    // Un technicien/client ne peut modifier que son propre profil
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que votre propre profil',
      });
    }

    const updated = await authService.updateUser(id, parsed.data);
    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour',
    });
  }
};

// ─────────────────────────────────────────────
// ADMIN : POST /api/auth — Crée un utilisateur (technicien, admin)
// ─────────────────────────────────────────────

export const createUser = async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ success: false, message: 'Données invalides', errors });
    }

    const result = await authService.createUserByAdmin(parsed.data);
    return res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Erreur lors de la création',
    });
  }
};

// ─────────────────────────────────────────────
// Utilitaire : route de redirection selon rôle (AUTH-08)
// ─────────────────────────────────────────────

const getRedirectByRole = (role) => {
  const redirectMap = {
    ADMIN: '/admin/dashboard',
    TECHNICIEN: '/technicien/planning',
    CLIENT: '/client/dashboard',
  };
  return redirectMap[role] || '/';
};
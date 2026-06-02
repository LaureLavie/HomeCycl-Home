// USER-02 à USER-05 : Contrôleur Utilisateurs (vue Admin)
// Compétence CDA : Développer des composants métier
import * as userService from '../services/userService.js';
import {
  createUserAdminSchema,
  updateUserAdminSchema,
  paginationSchema,
} from '../validators/sprint3Validator.js';

// ─────────────────────────────────────────────
// GET /api/users — Liste paginée des utilisateurs
// USER-02 : Affichage liste + tableau de bord
// ─────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Paramètres invalides' });
    }

    const result = await userService.getAllUsers(parsed.data);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// GET /api/users/stats — Statistiques du tableau de bord
// ─────────────────────────────────────────────

export const getUserStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// GET /api/users/:id — Détail d'un utilisateur
// ─────────────────────────────────────────────

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/users — Crée un utilisateur (admin only)
// USER-02 : Formulaire d'ajout
// ─────────────────────────────────────────────

export const createUser = async (req, res) => {
  try {
    const parsed = createUserAdminSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const user = await userService.createUserByAdmin(parsed.data);
    return res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/users/:id — Met à jour un utilisateur
// USER-04 : Sauvegarde manuelle
// ─────────────────────────────────────────────

export const updateUser = async (req, res) => {
  try {
    const parsed = updateUserAdminSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const user = await userService.updateUserById(req.params.id, parsed.data);
    return res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/users/:id — Désactive un utilisateur (soft delete RGPD)
// ─────────────────────────────────────────────

export const deactivateUser = async (req, res) => {
  try {
    // Sécurité : un admin ne peut pas se désactiver lui-même
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas désactiver votre propre compte',
      });
    }

    const user = await userService.deactivateUser(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Utilisateur désactivé',
      data: user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};
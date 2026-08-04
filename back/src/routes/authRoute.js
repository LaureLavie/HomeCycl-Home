// AUTH-03 à AUTH-10 : Définition des routes d'authentification
// Compétence CDA : Développer des composants métier — Architecture REST
import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';
import * as authController from '../controllers/authController.js';

const authRouter = express.Router();

// ─────────────────────────────────────────────
// Routes publiques (sans authentification)
// ─────────────────────────────────────────────

// US-02 : POST /api/auth/signup — Inscription
authRouter.post('/signup', authController.signup);

// US-03 : POST /api/auth/login — Connexion + génération JWT
authRouter.post('/login', authController.login);

// AUTH-09 : POST /api/auth/forgot-password — Demande de lien de réinitialisation
authRouter.post('/forgot-password', authController.forgotPassword);

// AUTH-10 : POST /api/auth/reset-password — Réinitialisation avec token
authRouter.post('/reset-password', authController.resetPassword);

// ─────────────────────────────────────────────
// Routes protégées (nécessitent un JWT valide)
// ─────────────────────────────────────────────

// US-03 : POST /api/auth/logout — Déconnexion (invalide le token)
authRouter.post('/logout', auth, authController.logout);

// GET /api/auth/me — Récupère le profil de l'utilisateur connecté
authRouter.get('/me', auth, authController.getMe);

// ─────────────────────────────────────────────
// Routes ADMIN uniquement
// ─────────────────────────────────────────────

// GET /api/auth — Liste tous les utilisateurs
authRouter.get('/', auth, authorize(['ADMIN']), authController.getAll);

// POST /api/auth — Crée un utilisateur (technicien, admin)
authRouter.post('/', auth, authorize(['ADMIN']), authController.createUser);

// DELETE /api/auth/:id — Désactive un utilisateur (soft delete)
authRouter.delete('/:id', auth, authorize(['ADMIN']), authController.deleteUser);

// ─────────────────────────────────────────────
// Routes ADMIN + propriétaire du compte
// ─────────────────────────────────────────────

// PUT /api/auth/:id — Met à jour le profil
authRouter.put('/:id', auth, authorize(['ADMIN', 'TECHNICIEN', 'CLIENT']), authController.updateUser);

export default authRouter;
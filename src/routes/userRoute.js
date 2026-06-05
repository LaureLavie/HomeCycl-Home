// Compétence CDA : Développer des composants métier — Architecture REST
import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';
import * as userController from '../controllers/userController.js';


// ═════════════════════════════════════════════
// ROUTES UTILISATEURS — US-05
// Toutes réservées à l'ADMIN
// ═════════════════════════════════════════════

export const userRouter = express.Router();

// GET  /api/users/stats      — Statistiques tableau de bord
userRouter.get(
  '/stats',
  auth,
  authorize(['ADMIN']),
  userController.getUserStats
);

// GET  /api/users            — Liste paginée (+ recherche ?search=xxx)
userRouter.get(
  '/',
  auth,
  authorize(['ADMIN']),
  userController.getAllUsers
);

// GET  /api/users/:id        — Détail d'un utilisateur
userRouter.get(
  '/:id',
  auth,
  authorize(['ADMIN']),
  userController.getUserById
);

// POST /api/users            — Crée un utilisateur (technicien, admin)
userRouter.post(
  '/',
  auth,
  authorize(['ADMIN']),
  userController.createUser
);

// PUT  /api/users/:id        — Met à jour (USER-04 : bouton sauvegarde)
userRouter.put(
  '/:id',
  auth,
  authorize(['ADMIN']),
  userController.updateUser
);

// DELETE /api/users/:id      — Désactive (soft delete RGPD)
userRouter.delete(
  '/:id',
  auth,
  authorize(['ADMIN']),
  userController.deactivateUser
);
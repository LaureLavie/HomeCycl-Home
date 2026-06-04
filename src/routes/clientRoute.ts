// Compétence CDA : Développer des composants métier — Architecture REST
import express from 'express';
import { auth } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import * as clientController from '../controllers/clientController';

// ═════════════════════════════════════════════
// ROUTES CLIENTS — US-06
// ADMIN : accès complet
// CLIENT : accès à son propre profil (via /api/auth/me)
// ═════════════════════════════════════════════

export const clientRouter = express.Router();

// GET  /api/clients/stats    — Stats pour tableau de bord admin
clientRouter.get(
  '/stats',
  auth,
  authorize(['ADMIN']),
  clientController.getClientStats
);

// GET  /api/clients          — Liste paginée (admin seulement)
clientRouter.get(
  '/',
  auth,
  authorize(['ADMIN']),
  clientController.getAllClients
);

// GET  /api/clients/:id      — Détail client (admin ou client propriétaire)
clientRouter.get(
  '/:id',
  auth,
  authorize(['ADMIN', 'CLIENT']),
  clientController.getClientById
);

// PUT  /api/clients/:id      — Mise à jour (CLIENT-04 : bouton sauvegarde)
clientRouter.put(
  '/:id',
  auth,
  authorize(['ADMIN', 'CLIENT']),
  clientController.updateClient
);
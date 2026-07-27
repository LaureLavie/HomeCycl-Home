// Compétence CDA : Développer des composants métier — Architecture REST
import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';
import * as entrepriseController from '../controllers/entrepriseController.js';

// ═════════════════════════════════════════════
// ROUTES ENTREPRISE — US-04
// Toutes réservées à l'ADMIN
// ═════════════════════════════════════════════

export const entrepriseRouter = express.Router();

// GET  /api/entreprise       — Récupère les infos (formulaire pré-rempli)
entrepriseRouter.get(
  '/',
  auth,
  authorize(['ADMIN']),
  entrepriseController.getEntreprise
);

// POST /api/entreprise       — Crée les infos (premier setup)
entrepriseRouter.post(
  '/',
  auth,
  authorize(['ADMIN']),
  entrepriseController.createEntreprise
);

// POST /api/entreprise/save  — Upsert (bouton "Sauvegarder" front) ENT-04
entrepriseRouter.post(
  '/save',
  auth,
  authorize(['ADMIN']),
  entrepriseController.saveEntreprise
);

// PUT  /api/entreprise/:id   — Met à jour les infos
entrepriseRouter.put(
  '/:id',
  auth,
  authorize(['ADMIN']),
  entrepriseController.updateEntreprise
);
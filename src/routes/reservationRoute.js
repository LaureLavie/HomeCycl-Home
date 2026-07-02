// Sprint 6 — Routes Client : Réservation, Inscription, Profil, Cycles, Historique
// Compétence CDA : Développer des composants métier — Architecture REST
import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';
import { injectClient } from '../middlewares/clientGuard.js';
import * as ctrl from '../controllers/reservationController.js';

// ═════════════════════════════════════════════
// ROUTER RÉSERVATION — US-21 / US-22
// Préfixe : /api/reservations
// ═════════════════════════════════════════════

export const reservationRouter = express.Router();

// ─────────────────────────────────────────────
// US-21 : POST /api/reservations
// Route PUBLIQUE (accessible sans compte, le token est optionnel)
// Si connecté → rattache directement à l'id_client
// Si anonyme → crée l'intervention sans id_client + hint de redirect
// ─────────────────────────────────────────────

reservationRouter.post('/',
  // Middleware optionnel : décode le JWT si présent, ne bloque pas sinon
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Importe auth depuis le middleware existant
      return auth(req, res, () => injectClient(req, res, next));
    }
    // Pas de token → réservation anonyme
    req.client = null;
    next();
  },
  ctrl.creerReservation
);

// Les routes suivantes nécessitent un compte CLIENT connecté
const clientAuth = [auth, authorize(['ADMIN', 'CLIENT']), injectClient];

// RESA-06 : GET /api/reservations — liste des réservations
reservationRouter.get('/',
  ...clientAuth,
  ctrl.getMesReservations
);

// Détail d'une réservation
reservationRouter.get('/:id',
  ...clientAuth,
  ctrl.getDetailReservation
);

// RESA-07/08 : POST /api/reservations/:id/annuler
reservationRouter.post('/:id/annuler',
  ...clientAuth,
  ctrl.annulerReservation
);

// ═════════════════════════════════════════════
// ROUTER INSCRIPTION — US-23
// Préfixe : /api/inscription
// ═════════════════════════════════════════════

export const inscriptionRouter = express.Router();

// RESA-09/10/11 : POST /api/inscription/finaliser
// Route publique — accessible sans JWT (le client n'a pas encore de compte)
inscriptionRouter.post('/finaliser',
  ctrl.finaliserInscription
);

// ═════════════════════════════════════════════
// ROUTER PROFIL CLIENT — US-24
// Préfixe : /api/client/profil
// ═════════════════════════════════════════════

export const profilRouter = express.Router();

const clientAuth2 = [auth, authorize(['CLIENT']), injectClient];

// RESA-12/13 : GET /api/client/profil
profilRouter.get('/',
  ...clientAuth2,
  ctrl.getMonProfil
);

// RESA-14 : PUT /api/client/profil
profilRouter.put('/',
  ...clientAuth2,
  ctrl.updateMonProfil
);

// ═════════════════════════════════════════════
// ROUTER CYCLES (VÉLOS) — US-25
// Préfixe : /api/client/velos
// ═════════════════════════════════════════════

export const veloRouter = express.Router();

// RESA-15 : GET /api/client/velos
veloRouter.get('/',
  ...clientAuth2,
  ctrl.getMesVelos
);

// GET /api/client/velos/:id (RESA-16 : formulaire pré-rempli)
veloRouter.get('/:id',
  ...clientAuth2,
  ctrl.getMonVelo
);

// POST /api/client/velos
veloRouter.post('/',
  ...clientAuth2,
  ctrl.ajouterVelo
);

// RESA-17 : PUT /api/client/velos/:id
veloRouter.put('/:id',
  ...clientAuth2,
  ctrl.updateVelo
);

// DELETE /api/client/velos/:id
veloRouter.delete('/:id',
  ...clientAuth2,
  ctrl.supprimerVelo
);

// ═════════════════════════════════════════════
// ROUTER HISTORIQUE — US-26
// Préfixe : /api/client/historique
// ═════════════════════════════════════════════

export const historiqueRouter = express.Router();

// RESA-18 : GET /api/client/historique
historiqueRouter.get('/',
  ...clientAuth2,
  ctrl.getMonHistorique
);

// Détail d'une intervention de l'historique
historiqueRouter.get('/:id',
  ...clientAuth2,
  ctrl.getDetailHistorique
);
// Sprint 5 — Routes Technicien
// Compétence CDA : Développer des composants métier — Architecture REST
// Toutes les routes sont préfixées /api/tech
import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';
import { injectTechnicien, checkOwnsIntervention } from '../middlewares/technicienError.js';
import { upload, handleUploadError } from '../middlewares/upload.js';
import * as techCtrl from '../controllers/technicienController.js';

export const techRouter = express.Router();

// ─────────────────────────────────────────────
// Middlewares appliqués à toutes les routes technicien :
// 1. auth         → vérifie le JWT
// 2. authorize    → vérifie le rôle TECHNICIEN (ou ADMIN)
// 3. injectTech   → récupère l'entité Technicien depuis l'id auth
// ─────────────────────────────────────────────

const techAuth = [auth, authorize(['ADMIN', 'TECHNICIEN']), injectTechnicien];

// ═════════════════════════════════════════════
// INTERVENTIONS — US-12 / US-16
// ═════════════════════════════════════════════

// TECH-01 : Liste de ses interventions
// GET ?statut=PLANIFIEE&date_jour=2026-06-10&page=1
techRouter.get('/interventions',
  ...techAuth,
  techCtrl.getMesInterventions
);

// TECH-11 : Détail d'une intervention (US-16)
techRouter.get('/interventions/:id',
  ...techAuth,
  checkOwnsIntervention,
  techCtrl.getMonInterventionDetail
);

// TECH-02 : Modification d'une intervention (US-12)
techRouter.put('/interventions/:id',
  ...techAuth,
  checkOwnsIntervention,
  techCtrl.modifierMonIntervention
);

// ─────────────────────────────────────────────
// US-18 : COMMENTAIRE
// TECH-15 : PATCH (endpoint dédié — plus sémantique qu'un PUT complet)
// ─────────────────────────────────────────────

techRouter.patch('/interventions/:id/commentaire',
  ...techAuth,
  checkOwnsIntervention,
  techCtrl.ajouterCommentaire
);

// ─────────────────────────────────────────────
// US-19 : MARQUER TERMINÉE
// TECH-17 : POST /terminer (action irréversible → verbe POST, pas PATCH)
// ─────────────────────────────────────────────

techRouter.post('/interventions/:id/terminer',
  ...techAuth,
  checkOwnsIntervention,
  techCtrl.marquerTerminee
);

// ─────────────────────────────────────────────
// US-20 : ANNULER UNE INTERVENTION
// TECH-19 : POST /annuler (confirmation pop-up côté front avant cet appel)
// ─────────────────────────────────────────────

techRouter.post('/interventions/:id/annuler',
  ...techAuth,
  checkOwnsIntervention,
  techCtrl.annulerIntervention
);

// ═════════════════════════════════════════════
// PLANNING — US-13 (TECH-05)
// ═════════════════════════════════════════════

// GET ?date_debut=2026-06-09T00:00:00Z&date_fin=2026-06-15T23:59:59Z
// Si pas de dates → semaine courante par défaut
techRouter.get('/planning',
  ...techAuth,
  techCtrl.getMonPlanning
);

// ═════════════════════════════════════════════
// CLIENTS — US-14 / US-15
// ═════════════════════════════════════════════

// TECH-06 : Liste clients du technicien
techRouter.get('/clients',
  ...techAuth,
  techCtrl.getMesClients
);

// TECH-10 : Détail complet d'un client (US-15)
techRouter.get('/clients/:id',
  ...techAuth,
  techCtrl.getMonClientDetail
);

// TECH-07 : Modification des infos client (US-14)
techRouter.put('/clients/:id',
  ...techAuth,
  techCtrl.modifierMonClient
);

// ═════════════════════════════════════════════
// PHOTOS — US-17
// ═════════════════════════════════════════════

// TECH-12 : Upload photos d'une intervention
// Multer accepte jusqu'à 5 fichiers dans le champ "photos"
techRouter.post('/interventions/:id/photos',
  ...techAuth,
  checkOwnsIntervention,
  upload.array('photos', 5),   // champ multipart : "photos"
  handleUploadError,            // gestion erreurs Multer (TECH-14)
  techCtrl.uploaderPhotos
);

// Liste des photos d'une intervention
techRouter.get('/interventions/:id/photos',
  ...techAuth,
  checkOwnsIntervention,
  techCtrl.getPhotosIntervention
);

// Suppression d'une photo
techRouter.delete('/photos/:id_photo',
  ...techAuth,
  techCtrl.supprimerPhoto
);
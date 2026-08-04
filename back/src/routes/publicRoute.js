// EPIC 4 — Routes publiques du catalogue (tunnel de réservation anonyme)
// Compétence CDA : Développer des composants métier — Architecture REST
//
// Volontairement AUCUN middleware auth/authorize ici : ces routes doivent
// être lisibles par un visiteur non connecté (US-21). Elles n'exposent que
// des données déjà destinées au grand public (forfaits actifs, zones, créneaux).
import express from 'express';
import * as publicController from '../controllers/publicController.js';

export const publicRouter = express.Router();

publicRouter.get('/forfaits', publicController.getForfaitsPublics);
publicRouter.get('/produits', publicController.getProduitsPublics);
publicRouter.get('/zones', publicController.getZonesPubliques);
publicRouter.get('/creneaux', publicController.getCreneauxPublics);
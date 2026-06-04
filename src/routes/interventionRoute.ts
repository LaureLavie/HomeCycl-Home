// Sprint 4 — Routes : Interventions, Forfaits, Produits, Zones, Planning
// Compétence CDA : Développer des composants métier — Architecture REST
import express from 'express';
import { auth } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import * as ctrl from '../controllers/interventionController';

// ═════════════════════════════════════════════
// ROUTES INTERVENTIONS — US-07
// Admin : CRUD complet
// Technicien : lecture + mise à jour statut
// ═════════════════════════════════════════════

export const interventionRouter = express.Router();

// Statistiques (avant /:id pour éviter le conflit de route)
interventionRouter.get('/stats',
  auth, authorize(['ADMIN']),
  ctrl.getInterventionStats
);

// Liste avec filtres : ?statut=PLANIFIEE&id_technicien=xx&date_debut=xx&date_fin=xx
interventionRouter.get('/',
  auth, authorize(['ADMIN', 'TECHNICIEN']),
  ctrl.getAllInterventions
);

interventionRouter.get('/:id',
  auth, authorize(['ADMIN', 'TECHNICIEN']),
  ctrl.getInterventionById
);

interventionRouter.post('/',
  auth, authorize(['ADMIN']),
  ctrl.createIntervention
);

// PUT accessible aussi au technicien (modifier statut, ajouter commentaire/photo)
interventionRouter.put('/:id',
  auth, authorize(['ADMIN', 'TECHNICIEN']),
  ctrl.updateIntervention
);

// DELETE réservé à l'admin uniquement
interventionRouter.delete('/:id',
  auth, authorize(['ADMIN']),
  ctrl.deleteIntervention
);

// ═════════════════════════════════════════════
// ROUTES FORFAITS (tarifs) — US-08
// ═════════════════════════════════════════════

export const forfaitRouter = express.Router();

// GET public depuis le front client pour afficher les forfaits disponibles
// (filtrable avec ?actif=true)
forfaitRouter.get('/',
  auth, authorize(['ADMIN', 'TECHNICIEN', 'CLIENT']),
  ctrl.getAllForfaits
);

forfaitRouter.get('/:id',
  auth, authorize(['ADMIN', 'TECHNICIEN', 'CLIENT']),
  ctrl.getForfaitById
);

forfaitRouter.post('/',
  auth, authorize(['ADMIN']),
  ctrl.createForfait
);

// INTERV-09 : bouton sauvegarde/modifier
forfaitRouter.put('/:id',
  auth, authorize(['ADMIN']),
  ctrl.updateForfait
);

// Désactivation ou suppression selon les dépendances
forfaitRouter.delete('/:id',
  auth, authorize(['ADMIN']),
  ctrl.deactivateForfait
);

// ═════════════════════════════════════════════
// ROUTES PRODUITS ADDITIONNELS — US-09
// ═════════════════════════════════════════════

export const produitRouter = express.Router();

produitRouter.get('/',
  auth, authorize(['ADMIN', 'TECHNICIEN', 'CLIENT']),
  ctrl.getAllProduits
);

produitRouter.get('/:id',
  auth, authorize(['ADMIN', 'TECHNICIEN']),
  ctrl.getProduitById
);

produitRouter.post('/',
  auth, authorize(['ADMIN']),
  ctrl.createProduit
);

// INTERV-14 : bouton sauvegarde/modifier
produitRouter.put('/:id',
  auth, authorize(['ADMIN']),
  ctrl.updateProduit
);

produitRouter.delete('/:id',
  auth, authorize(['ADMIN']),
  ctrl.deactivateProduit
);

// ═════════════════════════════════════════════
// ROUTES ZONES GÉOGRAPHIQUES — US-10
// ═════════════════════════════════════════════

export const zoneRouter = express.Router();

// Endpoint dédié Leaflet — retourne le GeoJSON parsé
// MAP-02 : à appeler au chargement de la carte
zoneRouter.get('/geojson',
  auth, authorize(['ADMIN', 'TECHNICIEN']),
  ctrl.getZonesGeoJson
);

zoneRouter.get('/',
  auth, authorize(['ADMIN']),
  ctrl.getAllZones
);

zoneRouter.get('/:id',
  auth, authorize(['ADMIN']),
  ctrl.getZoneById
);

// MAP-04 : bouton sauvegarde zone
zoneRouter.post('/',
  auth, authorize(['ADMIN']),
  ctrl.createZone
);

zoneRouter.put('/:id',
  auth, authorize(['ADMIN']),
  ctrl.updateZone
);

zoneRouter.delete('/:id',
  auth, authorize(['ADMIN']),
  ctrl.deleteZone
);

// ═════════════════════════════════════════════
// ROUTES PLANNING — US-11
// ═════════════════════════════════════════════

export const planningRouter = express.Router();

// INTERV-17 : liste des techniciens avec leurs zones
planningRouter.get('/techniciens',
  auth, authorize(['ADMIN']),
  ctrl.getListeTechniciens
);

// INTERV-16 : planning global admin (?date_debut=&date_fin=)
planningRouter.get('/global',
  auth, authorize(['ADMIN']),
  ctrl.getPlanningGlobal
);

// Modèles de planification
planningRouter.get('/modeles',
  auth, authorize(['ADMIN']),
  ctrl.getAllModelePlanification
);

// Assigner un technicien à un modèle de planification
planningRouter.post('/assigner',
  auth, authorize(['ADMIN']),
  ctrl.assignerTechnicien
);

// INTERV-16 : planning d'un technicien précis
planningRouter.get('/techniciens/:id',
  auth, authorize(['ADMIN', 'TECHNICIEN']),
  ctrl.getPlanningTechnicien
);
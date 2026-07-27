// Sprint 7 — Contrôleur EPIC 5 : Gestion des Planifications
// PLAN-01 à PLAN-13
// Compétence CDA : Développer des composants métier
import * as modelePlanifService from '../services/modelePlanifService.js';
import * as modeleZoneService from '../services/modeleZoneService.js';
import * as affectationService from '../services/affectationService.js';
import * as creneauxService from '../services/creneauxService.js';
import {
  createModelePlanificationSchema,
  updateModelePlanificationSchema,
  createModeleZoneSchema,
  updateModeleZoneSchema,
  affecterTechnicienSchema,
  updateForfaitDureeSchema,
  rechercheCreneauxSchema,
} from '../validators/validators.js';

// ═════════════════════════════════════════════
// US-27 : MODÈLES DE PLANIFICATION
// ═════════════════════════════════════════════

// PLAN-03 : GET /api/planning/modeles — Liste tous les modèles
export const getAllModeles = async (req, res) => {
  try {
    const actifSeulement = req.query.actif === 'true';
    const modeles = await modelePlanifService.getAllModelePlanification({ actifSeulement });
    return res.status(200).json({ success: true, data: modeles, total: modeles.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/planning/modeles/:id — Détail d'un modèle
export const getModeleById = async (req, res) => {
  try {
    const modele = await modelePlanifService.getModelePlanificationById(req.params.id);
    return res.status(200).json({ success: true, data: modele });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// PLAN-02 : POST /api/planning/modeles — Créer un modèle
export const createModele = async (req, res) => {
  try {
    const parsed = createModelePlanificationSchema.safeParse(req.body);
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

    const modele = await modelePlanifService.createModelePlanification(parsed.data);
    return res.status(201).json({
      success: true,
      message: 'Modèle de planification créé avec succès',
      data: modele,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// PUT /api/planning/modeles/:id — Mettre à jour un modèle
export const updateModele = async (req, res) => {
  try {
    const parsed = updateModelePlanificationSchema.safeParse(req.body);
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

    const modele = await modelePlanifService.updateModelePlanification(req.params.id, parsed.data);
    return res.status(200).json({
      success: true,
      message: 'Modèle mis à jour',
      data: modele,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// DELETE /api/planning/modeles/:id
export const deleteModele = async (req, res) => {
  try {
    await modelePlanifService.deleteModelePlanification(req.params.id);
    return res.status(200).json({ success: true, message: 'Modèle supprimé/désactivé' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ═════════════════════════════════════════════
// US-28 : ASSOCIATIONS MODÈLE ↔ ZONE
// ═════════════════════════════════════════════

// PLAN-06 : GET /api/planning/modeles/:id/zones — Zones d'un modèle
export const getZonesDeModele = async (req, res) => {
  try {
    const result = await modeleZoneService.getModeleZones(req.params.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// GET /api/planning/associations — Toutes les associations
export const getAllAssociations = async (req, res) => {
  try {
    const associations = await modeleZoneService.getAllModeleZones();
    return res.status(200).json({ success: true, data: associations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// PLAN-05 : POST /api/planning/associations — Créer une association
export const createAssociation = async (req, res) => {
  try {
    const parsed = createModeleZoneSchema.safeParse(req.body);
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

    const association = await modeleZoneService.createModeleZone(parsed.data);
    return res.status(201).json({
      success: true,
      message: 'Association modèle-zone créée avec succès',
      data: association,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// PUT /api/planning/associations/:id
export const updateAssociation = async (req, res) => {
  try {
    const parsed = updateModeleZoneSchema.safeParse(req.body);
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

    const association = await modeleZoneService.updateModeleZone(req.params.id, parsed.data);
    return res.status(200).json({
      success: true,
      message: 'Association mise à jour',
      data: association,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// DELETE /api/planning/associations/:id
export const deleteAssociation = async (req, res) => {
  try {
    await modeleZoneService.deleteModeleZone(req.params.id);
    return res.status(200).json({ success: true, message: 'Association supprimée' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ═════════════════════════════════════════════
// US-29 : AFFECTATIONS TECHNICIEN ↔ MODÈLE
// ═════════════════════════════════════════════

// PLAN-10 : GET /api/planning/techniciens — Tous les techniciens + affectations
export const getTechniciensAffectations = async (req, res) => {
  try {
    const techniciens = await affectationService.getAllTechniciensAvecAffectations();
    return res.status(200).json({ success: true, data: techniciens });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/planning/techniciens/:id/affectations
export const getAffectationsTechnicien = async (req, res) => {
  try {
    const result = await affectationService.getAffectationsTechnicien(req.params.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// PLAN-09 : POST /api/planning/affecter — Affecter un modèle à un technicien
export const affecterTechnicien = async (req, res) => {
  try {
    const parsed = affecterTechnicienSchema.safeParse(req.body);
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

    const result = await affectationService.affecterModeleATechnicien(parsed.data);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// DELETE /api/planning/affecter
export const retirerAffectation = async (req, res) => {
  try {
    const { id_technicien, id_modele_planification } = req.body;
    if (!id_technicien || !id_modele_planification) {
      return res.status(400).json({
        success: false,
        message: 'id_technicien et id_modele_planification sont obligatoires',
      });
    }

    await affectationService.retirerAffectation(id_technicien, id_modele_planification);
    return res.status(200).json({ success: true, message: 'Affectation retirée' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ═════════════════════════════════════════════
// US-30 : DURÉE DES FORFAITS
// ═════════════════════════════════════════════

// PLAN-12 : PATCH /api/forfaits/:id/duree — Met à jour la durée d'un forfait
export const updateDureeForfait = async (req, res) => {
  try {
    const parsed = updateForfaitDureeSchema.safeParse(req.body);
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

    const forfait = await creneauxService.updateForfaitDuree(
      req.params.id,
      parsed.data.duree_minutes
    );
    return res.status(200).json({
      success: true,
      message: `Durée mise à jour : ${parsed.data.duree_minutes} minutes`,
      data: forfait,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// GET /api/forfaits/sans-duree — Alerte admin : forfaits sans durée configurée
export const getForfaitsSansDuree = async (req, res) => {
  try {
    const forfaits = await creneauxService.getForfaitsSansDuree();
    return res.status(200).json({
      success: true,
      data: forfaits,
      alerte: forfaits.length > 0
        ? `${forfaits.length} forfait(s) actif(s) sans durée — la génération de créneaux sera impossible pour ces forfaits`
        : null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ═════════════════════════════════════════════
// US-31 : CRÉNEAUX DISPONIBLES
// ═════════════════════════════════════════════

// PLAN-13 : GET /api/planning/creneaux — Génère les créneaux disponibles
// Appelé par le formulaire de réservation client (Next.js)
export const getCreneauxDisponibles = async (req, res) => {
  try {
    const parsed = rechercheCreneauxSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const result = await creneauxService.genererCreneauxDisponibles(parsed.data);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
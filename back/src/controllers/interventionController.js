// Compétence CDA : Développer des composants métier
import * as interventionService from '../services/interventionService.js';
import * as forfaitService from '../services/forfaitService.js';
import * as produitService from '../services/produitService.js';
import * as zoneService from '../services/zoneService.js';
import * as planningService from '../services/planningService.js';
import {
  createInterventionSchema,
  updateInterventionSchema,
  filtreInterventionSchema,
  createForfaitSchema,
  updateForfaitSchema,
  createProduitSchema,
  updateProduitSchema,
  createZoneSchema,
  updateZoneSchema,
  assignerTechnicienSchema,
} from '../validators/validators.js';

// ═════════════════════════════════════════════
// US-07 : INTERVENTIONS
// ═════════════════════════════════════════════

export const getAllInterventions = async (req, res) => {
  try {
    const parsed = filtreInterventionSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'Paramètres invalides' });

    const result = await interventionService.getAllInterventions(parsed.data);
    return res.status(200).json({ success: true, ...result });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getInterventionStats = async (req, res) => {
  try {
    const stats = await interventionService.getInterventionStats();
    return res.status(200).json({ success: true, data: stats });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getInterventionById = async (req, res) => {
  try {
    const intervention = await interventionService.getInterventionById(req.params.id);
    return res.status(200).json({ success: true, data: intervention });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const createIntervention = async (req, res) => {
  try {
    const parsed = createInterventionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const intervention = await interventionService.createIntervention(parsed.data);
    return res.status(201).json({ success: true, message: 'Intervention créée', data: intervention });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateIntervention = async (req, res) => {
  try {
    const parsed = updateInterventionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const intervention = await interventionService.updateIntervention(req.params.id, parsed.data);
    return res.status(200).json({ success: true, message: 'Intervention mise à jour', data: intervention });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deleteIntervention = async (req, res) => {
  try {
    await interventionService.deleteIntervention(req.params.id);
    return res.status(200).json({ success: true, message: 'Intervention supprimée' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ═════════════════════════════════════════════
// US-08 : FORFAITS (tarifs)
// ═════════════════════════════════════════════

export const getAllForfaits = async (req, res) => {
  try {
    // ?actif=true pour filtrer (front client ne voit que les actifs)
    const actifSeulement = req.query.actif === 'true';
    const forfaits = await forfaitService.getAllForfaits({ actifSeulement });
    return res.status(200).json({ success: true, data: forfaits });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getForfaitById = async (req, res) => {
  try {
    const forfait = await forfaitService.getForfaitById(req.params.id);
    return res.status(200).json({ success: true, data: forfait });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const createForfait = async (req, res) => {
  try {
    const parsed = createForfaitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const forfait = await forfaitService.createForfait(parsed.data);
    return res.status(201).json({ success: true, message: 'Forfait créé', data: forfait });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateForfait = async (req, res) => {
  try {
    const parsed = updateForfaitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const forfait = await forfaitService.updateForfait(req.params.id, parsed.data);
    return res.status(200).json({ success: true, message: 'Forfait mis à jour', data: forfait });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deactivateForfait = async (req, res) => {
  try {
    const result = await forfaitService.deactivateForfait(req.params.id);
    return res.status(200).json({ success: true, message: 'Forfait désactivé/supprimé', data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ═════════════════════════════════════════════
// US-09 : PRODUITS ADDITIONNELS
// ═════════════════════════════════════════════

export const getAllProduits = async (req, res) => {
  try {
    const actifSeulement = req.query.actif === 'true';
    const produits = await produitService.getAllProduits({ actifSeulement });
    return res.status(200).json({ success: true, data: produits });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getProduitById = async (req, res) => {
  try {
    const produit = await produitService.getProduitById(req.params.id);
    return res.status(200).json({ success: true, data: produit });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const createProduit = async (req, res) => {
  try {
    const parsed = createProduitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const produit = await produitService.createProduit(parsed.data);
    return res.status(201).json({ success: true, message: 'Produit créé', data: produit });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateProduit = async (req, res) => {
  try {
    const parsed = updateProduitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const produit = await produitService.updateProduit(req.params.id, parsed.data);
    return res.status(200).json({ success: true, message: 'Produit mis à jour', data: produit });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deactivateProduit = async (req, res) => {
  try {
    const result = await produitService.deactivateProduit(req.params.id);
    return res.status(200).json({ success: true, message: 'Produit désactivé/supprimé', data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ═════════════════════════════════════════════
// US-10 : ZONES GÉOGRAPHIQUES
// ═════════════════════════════════════════════

export const getAllZones = async (req, res) => {
  try {
    const zones = await zoneService.getAllZones();
    return res.status(200).json({ success: true, data: zones });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getZonesGeoJson = async (req, res) => {
  try {
    // Endpoint dédié Leaflet — retourne uniquement le GeoJSON parsé
    const zones = await zoneService.getZonesGeoJson();
    return res.status(200).json({ success: true, data: zones });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const zone = await zoneService.getZoneById(req.params.id);
    return res.status(200).json({ success: true, data: zone });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const createZone = async (req, res) => {
  try {
    const parsed = createZoneSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const zone = await zoneService.createZone(parsed.data);
    return res.status(201).json({ success: true, message: 'Zone créée', data: zone });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateZone = async (req, res) => {
  try {
    const parsed = updateZoneSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const zone = await zoneService.updateZone(req.params.id, parsed.data);
    return res.status(200).json({ success: true, message: 'Zone mise à jour', data: zone });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deleteZone = async (req, res) => {
  try {
    await zoneService.deleteZone(req.params.id);
    return res.status(200).json({ success: true, message: 'Zone supprimée' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// ═════════════════════════════════════════════
// US-11 : PLANNING TECHNICIENS
// ═════════════════════════════════════════════

export const getPlanningTechnicien = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query;
    const result = await planningService.getPlanningTechnicien(req.params.id, {
      date_debut,
      date_fin,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getPlanningGlobal = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query;
    const result = await planningService.getPlanningGlobal({ date_debut, date_fin });
    return res.status(200).json({ success: true, data: result });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getListeTechniciens = async (req, res) => {
  try {
    const techniciens = await planningService.getListeTechniciens();
    return res.status(200).json({ success: true, data: techniciens });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getAllModelePlanification = async (req, res) => {
  try {
    const modeles = await planningService.getAllModelePlanification();
    return res.status(200).json({ success: true, data: modeles });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const assignerTechnicien = async (req, res) => {
  try {
    const parsed = assignerTechnicienSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const result = await planningService.assignerTechnicienModele(
      parsed.data.id_technicien,
      parsed.data.id_modele_planification
    );
    return res.status(200).json({ success: true, message: 'Technicien assigné', data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
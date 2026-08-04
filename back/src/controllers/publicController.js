// EPIC 4 — Catalogue public pour le tunnel de réservation (US-21)
// Compétence CDA : Développer des composants métier — Interfaces utilisateur (API REST)
//
// Pourquoi un routeur dédié plutôt que de réutiliser /api/forfait, /api/zone,
// /api/planning ? Ces routes existantes sont protégées par authorize(['ADMIN', ...])
// car elles exposent des données de gestion complètes. Le tunnel de réservation,
// lui, doit fonctionner pour un visiteur SANS compte (US-21 : réservation anonyme).
// On expose donc ici uniquement le sous-ensemble de champs nécessaires au client,
// jamais les données de gestion interne (coordonnées techniciens, stats, etc.).
import * as forfaitService from '../services/forfaitService.js';
import * as produitService from '../services/produitService.js';
import * as zoneService from '../services/zoneService.js';
import * as creneauxService from '../services/creneauxService.js';
import { rechercheCreneauxSchema } from '../validators/validators.js';

// GET /api/public/forfaits — uniquement les forfaits actifs
export const getForfaitsPublics = async (req, res) => {
  try {
    const forfaits = await forfaitService.getAllForfaits({ actifSeulement: true });
    // On ne renvoie que les champs utiles au client (pas de _count interne)
    const data = forfaits.map((f) => ({
      id_forfait: f.id_forfait,
      nom: f.nom,
      description: f.description,
      prix: f.prix,
      duree_minutes: f.duree_minutes,
      type_velo: f.type_velo,
    }));
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/public/produits — uniquement les produits actifs
export const getProduitsPublics = async (req, res) => {
  try {
    const produits = await produitService.getAllProduits({ actifSeulement: true });
    const data = produits.map((p) => ({
      id_produit: p.id_produit,
      nom: p.nom,
      description: p.description,
      prix: p.prix,
    }));
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/public/zones — liste simplifiée (id + nom) pour un select de secteur
export const getZonesPubliques = async (req, res) => {
  try {
    const zones = await zoneService.getZonesGeoJson();
    const data = zones.map((z) => ({
      id_zone: z.id_zone,
      nom: z.nom,
      frais_deplacement: z.frais_deplacement,
      geojson: z.geojson, // conservé : utile pour une future détection automatique par carte
    }));
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /api/public/creneaux — moteur de génération de créneaux (US-31)
// Query : id_forfait, id_zone, date_debut, date_fin (optionnel)
export const getCreneauxPublics = async (req, res) => {
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};
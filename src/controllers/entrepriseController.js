// ENT-02 à ENT-05 : Contrôleur Entreprise
// Compétence CDA : Développer des composants métier
import * as entrepriseService from '../services/entrepriseService.js';
import {
  createEntrepriseSchema,
  updateEntrepriseSchema,
} from '../validators/sprint3Validator.js';

// ─────────────────────────────────────────────
// GET /api/entreprise — Récupère les infos entreprise
// ─────────────────────────────────────────────

export const getEntreprise = async (req, res) => {
  try {
    const entreprise = await entrepriseService.getEntreprise();

    if (!entreprise) {
      // Retourne un objet vide : le formulaire front sera vide (premier setup)
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Aucune information entreprise. Veuillez remplir le formulaire.',
      });
    }

    return res.status(200).json({ success: true, data: entreprise });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// POST /api/entreprise — Crée les infos entreprise (premier setup)
// ─────────────────────────────────────────────

export const createEntreprise = async (req, res) => {
  try {
    const parsed = createEntrepriseSchema.safeParse(req.body);

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

    const entreprise = await entrepriseService.createEntreprise(parsed.data);
    return res.status(201).json({
      success: true,
      message: 'Informations entreprise créées',
      data: entreprise,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/entreprise/:id — Met à jour (ENT-04 : sauvegarde manuelle)
// ─────────────────────────────────────────────

export const updateEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = updateEntrepriseSchema.safeParse(req.body);

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

    const entreprise = await entrepriseService.updateEntreprise(id, parsed.data);
    return res.status(200).json({
      success: true,
      message: 'Informations entreprise sauvegardées',
      data: entreprise,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};

// ─────────────────────────────────────────────
// POST /api/entreprise/save — Upsert (crée ou met à jour)
// Correspond au bouton "Sauvegarder" du formulaire (ENT-04)
// ─────────────────────────────────────────────

export const saveEntreprise = async (req, res) => {
  try {
    // On accepte create ou update selon l'état
    const parsed = createEntrepriseSchema.safeParse(req.body);

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

    const entreprise = await entrepriseService.upsertEntreprise(parsed.data);
    return res.status(200).json({
      success: true,
      message: 'Informations entreprise sauvegardées avec succès',
      data: entreprise,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};
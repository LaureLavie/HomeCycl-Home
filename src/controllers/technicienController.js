// Sprint 5 — Contrôleur Technicien
// TECH-01 à TECH-20 : Toutes les actions du technicien
// Compétence CDA : Développer des composants métier
import * as techInterventionService from '../services/technicienService.js';
import * as techClientPhotoService from '../services/photoService.js';
import {
  filtreInterventionTechSchema,
  updateInterventionTechSchema,
  commentaireSchema,
  annulationSchema,
  updateClientTechSchema,
  photoMetaSchema,
} from '../validators/validator.js';

// ═════════════════════════════════════════════
// US-12 : INTERVENTIONS DU TECHNICIEN
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// TECH-01 : GET /api/tech/interventions
// Liste de toutes ses interventions avec filtres
// ─────────────────────────────────────────────

export const getMesInterventions = async (req, res) => {
  try {
    const parsed = filtreInterventionTechSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Paramètres invalides' });
    }

    const result = await techInterventionService.getInterventionsTechnicien(
      req.technicien.id_technicien,
      parsed.data
    );

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// TECH-11 : GET /api/tech/interventions/:id
// US-16 : Détail complet d'une intervention
// ─────────────────────────────────────────────

export const getMonInterventionDetail = async (req, res) => {
  try {
    const intervention = await techInterventionService.getInterventionDetaillee(
      req.params.id,
      req.technicien.id_technicien
    );
    return res.status(200).json({ success: true, data: intervention });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// TECH-02 : PUT /api/tech/interventions/:id
// US-12 : Formulaire pré-rempli + modification
// ─────────────────────────────────────────────

export const modifierMonIntervention = async (req, res) => {
  try {
    const parsed = updateInterventionTechSchema.safeParse(req.body);
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

    const updated = await techInterventionService.updateInterventionParTechnicien(
      req.params.id,
      req.technicien.id_technicien,
      parsed.data
    );

    return res.status(200).json({
      success: true,
      message: 'Intervention mise à jour',
      data: updated,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// TECH-05 : GET /api/tech/planning
// US-13 : Planning des interventions (semaine)
// ─────────────────────────────────────────────

export const getMonPlanning = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query;
    const planning = await techInterventionService.getPlanningTechnicienConnecte(
      req.technicien.id_technicien,
      { date_debut, date_fin }
    );
    return res.status(200).json({ success: true, data: planning });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// TECH-15 : PATCH /api/tech/interventions/:id/commentaire
// US-18 : Écrire un commentaire
// ─────────────────────────────────────────────

export const ajouterCommentaire = async (req, res) => {
  try {
    const parsed = commentaireSchema.safeParse(req.body);
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

    const result = await techInterventionService.ajouterCommentaire(
      req.params.id,
      req.technicien.id_technicien,
      parsed.data.commentaire
    );

    return res.status(200).json({
      success: true,
      message: 'Commentaire enregistré',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// TECH-17 : POST /api/tech/interventions/:id/terminer
// US-19 : Marquer l'intervention comme terminée
// ─────────────────────────────────────────────

export const marquerTerminee = async (req, res) => {
  try {
    const result = await techInterventionService.marquerTerminee(
      req.params.id,
      req.technicien.id_technicien
    );

    return res.status(200).json({
      success: true,
      message: '✅ Intervention marquée comme terminée',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// TECH-19 : POST /api/tech/interventions/:id/annuler
// US-20 : Annuler une intervention (avec pop-up de confirmation côté front)
// ─────────────────────────────────────────────

export const annulerIntervention = async (req, res) => {
  try {
    const parsed = annulationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
      });
    }

    const result = await techInterventionService.annulerIntervention(
      req.params.id,
      req.technicien.id_technicien,
      parsed.data.motif
    );

    return res.status(200).json({
      success: true,
      message: 'Intervention annulée',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ═════════════════════════════════════════════
// US-14 / US-15 : CLIENTS DU TECHNICIEN
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// TECH-06 : GET /api/tech/clients
// US-14 : Liste des clients du technicien
// ─────────────────────────────────────────────

export const getMesClients = async (req, res) => {
  try {
    const clients = await techClientPhotoService.getClientsDuTechnicien(
      req.technicien.id_technicien
    );
    return res.status(200).json({
      success: true,
      data: clients,
      total: clients.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// TECH-10 : GET /api/tech/clients/:id
// US-15 : Détail complet du client
// ─────────────────────────────────────────────

export const getMonClientDetail = async (req, res) => {
  try {
    const client = await techClientPhotoService.getClientDetailTechnicien(
      req.params.id,
      req.technicien.id_technicien
    );
    return res.status(200).json({ success: true, data: client });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// TECH-07 : PUT /api/tech/clients/:id
// US-14 : Modification du client (champs limités)
// ─────────────────────────────────────────────

export const modifierMonClient = async (req, res) => {
  try {
    const parsed = updateClientTechSchema.safeParse(req.body);
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

    const client = await techClientPhotoService.updateClientParTechnicien(
      req.params.id,
      req.technicien.id_technicien,
      parsed.data
    );

    return res.status(200).json({
      success: true,
      message: 'Informations client mises à jour',
      data: client,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ═════════════════════════════════════════════
// US-17 : PHOTOS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// TECH-12 : POST /api/tech/interventions/:id/photos
// Upload d'une ou plusieurs photos
// ─────────────────────────────────────────────

export const uploaderPhotos = async (req, res) => {
  try {
    // Multer a déjà traité les fichiers (req.files)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune photo reçue. Vérifiez que vous envoyez bien des fichiers.',
      });
    }

    // Validation des métadonnées (type)
    const parsed = photoMetaSchema.safeParse(req.body);
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

    const photos = await techClientPhotoService.enregistrerPhotos({
      id_intervention: req.params.id,
      id_client: req.body.id_client || null,
      fichiers: req.files,
      type: parsed.data.type,
    });

    return res.status(201).json({
      success: true,
      message: `${photos.length} photo(s) enregistrée(s)`,
      data: photos,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// GET /api/tech/interventions/:id/photos
// Liste des photos d'une intervention
// ─────────────────────────────────────────────

export const getPhotosIntervention = async (req, res) => {
  try {
    const photos = await techClientPhotoService.getPhotosIntervention(
      req.params.id,
      req.technicien.id_technicien
    );
    return res.status(200).json({
      success: true,
      data: photos,
      total: photos.length,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/tech/photos/:id_photo
// Suppression d'une photo (correction erreur)
// ─────────────────────────────────────────────

export const supprimerPhoto = async (req, res) => {
  try {
    await techClientPhotoService.supprimerPhoto(
      req.params.id_photo,
      req.technicien.id_technicien
    );
    return res.status(200).json({
      success: true,
      message: 'Photo supprimée',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
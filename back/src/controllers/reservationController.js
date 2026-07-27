// Sprint 6 — Contrôleur Client : Réservation, Profil, Cycles, Historique
// RESA-01 à RESA-18
// Compétence CDA : Développer des composants métier
import * as reservationService from '../services/reservationService.js';
import * as inscriptionService from '../services/inscriptionService.js';
import * as profilClientService from '../services/profilClientService.js';
import * as veloService from '../services/veloService.js';
import * as historiqueService from '../services/historiqueService.js';
import {
  createReservationSchema,
  annulerReservationSchema,
  finaliserInscriptionSchema,
  updateProfilClientSchema,
  createVeloSchema,
  updateVeloSchema,
  paginationClientSchema,
} from '../validators/validators.js';

// ═════════════════════════════════════════════
// US-21 : CRÉER UNE RÉSERVATION
// ═════════════════════════════════════════════

export const creerReservation = async (req, res) => {
  try {
    const parsed = createReservationSchema.safeParse(req.body);
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

    // id_client = null si pas connecté (réservation anonyme)
    const id_client = req.client?.id_client || null;

    const reservation = await reservationService.createReservation(parsed.data, id_client);

    // RESA-05 : Si pas de compte, le front doit rediriger vers l'inscription
    const response = {
      success: true,
      message: 'Réservation créée avec succès',
      data: reservation,
    };

    if (!id_client) {
      response.redirect = `/inscription?id_intervention=${reservation.id_intervention}`;
      response.message = 'Réservation enregistrée. Créez votre compte pour la confirmer.';
      response.requiresAccount = true;
    }

    return res.status(201).json(response);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur lors de la réservation',
    });
  }
};

// ═════════════════════════════════════════════
// US-22 : ANNULER UNE RÉSERVATION
// ═════════════════════════════════════════════

// RESA-06 : Liste des réservations du client
export const getMesReservations = async (req, res) => {
  try {
    const parsed = paginationClientSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Paramètres invalides' });
    }

    const result = await reservationService.getReservationsClient(
      req.client.id_client,
      parsed.data
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Détail d'une réservation
export const getDetailReservation = async (req, res) => {
  try {
    const reservation = await reservationService.getReservationDetail(
      req.params.id,
      req.client.id_client
    );
    return res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// RESA-07/08 : Annuler (pop-up de confirmation géré côté front)
export const annulerReservation = async (req, res) => {
  try {
    const parsed = annulerReservationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    const result = await reservationService.annulerReservationClient(
      req.params.id,
      req.client.id_client,
      parsed.data.motif
    );

    return res.status(200).json({
      success: true,
      message: 'Réservation annulée',
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
// US-23 : FINALISER L'INSCRIPTION (1ère réservation)
// ═════════════════════════════════════════════

export const finaliserInscription = async (req, res) => {
  try {
    const parsed = finaliserInscriptionSchema.safeParse(req.body);
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

    const result = await inscriptionService.finaliserInscription(parsed.data);

    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès. Bienvenue !',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur lors de la création du compte',
    });
  }
};

// ═════════════════════════════════════════════
// US-24 : PROFIL CLIENT
// ═════════════════════════════════════════════

// RESA-12/13 : Consulter le profil
export const getMonProfil = async (req, res) => {
  try {
    const profil = await profilClientService.getMonProfil(req.user.id);
    return res.status(200).json({ success: true, data: profil });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// RESA-14 : Mettre à jour le profil (bouton sauvegarde)
export const updateMonProfil = async (req, res) => {
  try {
    const parsed = updateProfilClientSchema.safeParse(req.body);
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

    const profil = await profilClientService.updateMonProfil(req.user.id, parsed.data);
    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour',
      data: profil,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ═════════════════════════════════════════════
// US-25 : CYCLES (VÉLOS)
// ═════════════════════════════════════════════

// RESA-15 : Liste des cycles
export const getMesVelos = async (req, res) => {
  try {
    const velos = await veloService.getMesVelos(req.client.id_client);
    return res.status(200).json({ success: true, data: velos, total: velos.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Détail d'un vélo (RESA-16 : formulaire pré-rempli)
export const getMonVelo = async (req, res) => {
  try {
    const velo = await veloService.getVeloById(req.params.id, req.client.id_client);
    return res.status(200).json({ success: true, data: velo });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Ajouter un vélo
export const ajouterVelo = async (req, res) => {
  try {
    const parsed = createVeloSchema.safeParse(req.body);
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

    const velo = await veloService.ajouterVelo(req.client.id_client, parsed.data);
    return res.status(201).json({
      success: true,
      message: 'Vélo ajouté avec succès',
      data: velo,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// RESA-17 : Modifier un vélo (bouton sauvegarde)
export const updateVelo = async (req, res) => {
  try {
    const parsed = updateVeloSchema.safeParse(req.body);
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

    const velo = await veloService.updateVelo(
      req.params.id,
      req.client.id_client,
      parsed.data
    );
    return res.status(200).json({
      success: true,
      message: 'Vélo mis à jour',
      data: velo,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Supprimer un vélo
export const supprimerVelo = async (req, res) => {
  try {
    await veloService.supprimerVelo(req.params.id, req.client.id_client);
    return res.status(200).json({ success: true, message: 'Vélo supprimé' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ═════════════════════════════════════════════
// US-26 : HISTORIQUE DES INTERVENTIONS
// ═════════════════════════════════════════════

// RESA-18 : Page historique
export const getMonHistorique = async (req, res) => {
  try {
    const parsed = paginationClientSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Paramètres invalides' });
    }

    const result = await historiqueService.getHistoriqueInterventions(
      req.client.id_client,
      parsed.data
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Détail d'une intervention de l'historique
export const getDetailHistorique = async (req, res) => {
  try {
    const intervention = await historiqueService.getDetailHistorique(
      req.params.id,
      req.client.id_client
    );
    return res.status(200).json({ success: true, data: intervention });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
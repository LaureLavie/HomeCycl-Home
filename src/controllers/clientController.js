// CLIENT-02 à CLIENT-05 : Contrôleur Clients (vue Admin)
// Compétence CDA : Développer des composants métier
import * as clientService from '../services/clientService.js';
import {
  updateClientSchema,
  paginationSchema,
} from '../validators/sprint3Validator.js';

// ─────────────────────────────────────────────
// GET /api/clients — Liste paginée des clients
// CLIENT-02 : Liste des clients
// ─────────────────────────────────────────────

export const getAllClients = async (req, res) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Paramètres invalides' });
    }

    const result = await clientService.getAllClients(parsed.data);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// GET /api/clients/stats — Stats pour tableau de bord
// ─────────────────────────────────────────────

export const getClientStats = async (req, res) => {
  try {
    const stats = await clientService.getClientStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// GET /api/clients/:id — Détail d'un client (formulaire pré-rempli)
// CLIENT-03 : Formulaire pré-rempli de modification
// ─────────────────────────────────────────────

export const getClientById = async (req, res) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    return res.status(200).json({ success: true, data: client });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};

// ─────────────────────────────────────────────
// PUT /api/clients/:id — Mise à jour client
// CLIENT-04 : Bouton sauvegarde + CLIENT-05 : Gestion des erreurs
// ─────────────────────────────────────────────

export const updateClient = async (req, res) => {
  try {
    const parsed = updateClientSchema.safeParse(req.body);

    if (!parsed.success) {
      // CLIENT-05 : Retourne les erreurs de validation formatées
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const client = await clientService.updateClient(req.params.id, parsed.data);
    return res.status(200).json({
      success: true,
      message: 'Informations client sauvegardées',
      data: client,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur serveur',
    });
  }
};
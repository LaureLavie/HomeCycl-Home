// Middleware : injecte le client connecté dans req.client
// Compétence CDA : Développer des composants métier — Sécurité
// Utilisé sur toutes les routes /api/client/*
import { prisma } from '../lib/prisma.js';

export const injectClient = async (req, res, next) => {
  try {
    // L'ADMIN peut accéder aux routes client sans profil client
    if (req.user.role === 'ADMIN') return next();

    const client = await prisma.client.findUnique({
      where: { id_authentification: req.user.id },
      select: {
        id_client: true,
        nom: true,
        prenom: true,
        id_authentification: true,
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Profil client introuvable. Veuillez compléter votre inscription.',
      });
    }

    req.client = client;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
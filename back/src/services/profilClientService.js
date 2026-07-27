// RESA-12/13/14 : Service Profil client (vue CLIENT)
// Compétence CDA : Développer des composants d'accès aux données SQL
// US-24 : Consultation et modification du profil personnel
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// GET — Récupère le profil complet du client connecté
// Utilisé pour pré-remplir le formulaire (RESA-13)
// ─────────────────────────────────────────────

export const getMonProfil = async (id_authentification) => {
  const profil = await prisma.client.findUnique({
    where: { id_authentification },
    include: {
      authentification: {
        select: { email: true, date_creation: true, date_modification: true },
      },
      // Nombre de réservations pour le tableau de bord
      _count: {
        select: { interventions: true, velos: true },
      },
    },
  });

  if (!profil) {
    const error = new Error('Profil client introuvable');
    error.statusCode = 404;
    throw error;
  }

  return profil;
};

// ─────────────────────────────────────────────
// PUT — Mise à jour du profil (RESA-14 : bouton sauvegarde)
// ─────────────────────────────────────────────

export const updateMonProfil = async (id_authentification, data) => {
  const client = await prisma.client.findUnique({
    where: { id_authentification },
  });

  if (!client) {
    const error = new Error('Profil client introuvable');
    error.statusCode = 404;
    throw error;
  }

  const { nom, prenom, telephone, adresse, code_postal, ville } = data;

  return await prisma.client.update({
    where: { id_authentification },
    data: {
      ...(nom !== undefined && { nom }),
      ...(prenom !== undefined && { prenom }),
      ...(telephone !== undefined && { telephone }),
      ...(adresse !== undefined && { adresse }),
      ...(code_postal !== undefined && { code_postal }),
      ...(ville !== undefined && { ville }),
    },
    select: {
      id_client: true,
      nom: true,
      prenom: true,
      telephone: true,
      adresse: true,
      code_postal: true,
      ville: true,
    },
  });
};
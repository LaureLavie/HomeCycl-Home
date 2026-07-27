// RESA-15/16/17 : Service Cycles du client
// Compétence CDA : Développer des composants d'accès aux données SQL
// US-25 : Consultation et modification des cycles (vélos)
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// GET ALL — Liste des vélos du client connecté
// ─────────────────────────────────────────────

export const getMesVelos = async (id_client) => {
  return await prisma.velo.findMany({
    where: { id_client },
    orderBy: { date_creation: 'desc' },
    include: {
      // Dernière intervention associée à ce vélo (pour info dans la liste)
      interventions: {
        select: { id_intervention: true, date_intervention: true, statut: true },
        orderBy: { date_intervention: 'desc' },
        take: 1,
      },
    },
  });
};

// ─────────────────────────────────────────────
// GET ONE — Détail d'un vélo (formulaire pré-rempli RESA-16)
// ─────────────────────────────────────────────

export const getVeloById = async (id_velo, id_client) => {
  const velo = await prisma.velo.findUnique({
    where: { id_velo },
    include: {
      interventions: {
        orderBy: { date_intervention: 'desc' },
        take: 5,
        include: {
          forfait: { select: { nom: true } },
        },
      },
    },
  });

  if (!velo) {
    const error = new Error('Vélo introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Vérification d'appartenance
  if (velo.id_client !== id_client) {
    const error = new Error('Ce vélo ne vous appartient pas');
    error.statusCode = 403;
    throw error;
  }

  return velo;
};

// ─────────────────────────────────────────────
// POST — Ajouter un vélo
// ─────────────────────────────────────────────

export const ajouterVelo = async (id_client, data) => {
  const { marque, modele, annee, type_velo, numero_serie } = data;

  // Limite à 10 vélos par client (règle métier MVP)
  const nbVelos = await prisma.velo.count({ where: { id_client } });
  if (nbVelos >= 10) {
    const error = new Error('Vous ne pouvez pas enregistrer plus de 10 vélos');
    error.statusCode = 422;
    throw error;
  }

  return await prisma.velo.create({
    data: {
      marque,
      modele,
      annee,
      type_velo,
      id_client,
    },
  });
};

// ─────────────────────────────────────────────
// PUT — Modifier un vélo (RESA-17 : bouton sauvegarde)
// ─────────────────────────────────────────────

export const updateVelo = async (id_velo, id_client, data) => {
  const velo = await prisma.velo.findUnique({ where: { id_velo } });

  if (!velo) {
    const error = new Error('Vélo introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (velo.id_client !== id_client) {
    const error = new Error('Ce vélo ne vous appartient pas');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.velo.update({
    where: { id_velo },
    data: {
      ...(data.marque !== undefined && { marque: data.marque }),
      ...(data.modele !== undefined && { modele: data.modele }),
      ...(data.annee !== undefined && { annee: data.annee }),
      ...(data.type_velo !== undefined && { type_velo: data.type_velo }),
    },
  });
};

// ─────────────────────────────────────────────
// DELETE — Supprimer un vélo
// Bloqué si une intervention est en cours ou planifiée
// ─────────────────────────────────────────────

export const supprimerVelo = async (id_velo, id_client) => {
  const velo = await prisma.velo.findUnique({
    where: { id_velo },
    include: {
      _count: { select: { interventions: true } },
      interventions: {
        where: { statut: { in: ['PLANIFIEE', 'EN_COURS'] } },
        select: { id_intervention: true },
        take: 1,
      },
    },
  });

  if (!velo) {
    const error = new Error('Vélo introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (velo.id_client !== id_client) {
    const error = new Error('Ce vélo ne vous appartient pas');
    error.statusCode = 403;
    throw error;
  }

  // Bloque si intervention active
  if (velo.interventions.length > 0) {
    const error = new Error(
      'Impossible de supprimer ce vélo : une intervention planifiée ou en cours y est associée'
    );
    error.statusCode = 422;
    throw error;
  }

  return await prisma.velo.delete({ where: { id_velo } });
};
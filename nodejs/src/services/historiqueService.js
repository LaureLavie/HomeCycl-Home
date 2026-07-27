// RESA-18 : Service Historique des interventions (vue Client)
// Compétence CDA : Développer des composants d'accès aux données SQL
// US-26 : Consultation de l'historique des interventions
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// GET — Historique complet des interventions du client
// Filtrable par statut pour distinguer passé / à venir
// ─────────────────────────────────────────────

export const getHistoriqueInterventions = async (id_client, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  // Sépare les interventions passées des futures (utile pour le front)
  const maintenant = new Date();

  const [interventions, total, stats] = await Promise.all([
    prisma.intervention.findMany({
      where: { id_client },
      skip,
      take: limit,
      orderBy: { date_intervention: 'desc' },
      include: {
        forfait: {
          select: { nom: true, prix: true, duree_minutes: true },
        },
        technicien: {
          select: { nom: true, prenom: true },
        },
        zone: { select: { nom: true } },
        velo: {
          select: { marque: true, modele: true, type_velo: true, annee: true },
        },
        inclure: {
          include: { produit: { select: { nom: true, prix: true } } },
        },
        photos: {
          select: { url_photo: true, type: true },
          orderBy: { date_creation: 'asc' },
        },
      },
    }),
    prisma.intervention.count({ where: { id_client } }),

    // Stats rapides pour le tableau de bord client
    prisma.intervention.groupBy({
      by: ['statut'],
      where: { id_client },
      _count: { statut: true },
    }),
  ]);

  // Formate les stats par statut
  const statsParStatut = stats.reduce((acc, s) => {
    acc[s.statut] = s._count.statut;
    return acc;
  }, {});

  // Enrichit chaque intervention avec une indication passé/futur
  const enrichies = interventions.map((interv) => ({
    ...interv,
    estPassee: new Date(interv.date_intervention) < maintenant,
  }));

  return {
    data: enrichies,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    stats: {
      total,
      parStatut: statsParStatut,
      totalTerminees: statsParStatut['TERMINEE'] || 0,
      totalPlanifiees: statsParStatut['PLANIFIEE'] || 0,
      totalAnnulees: statsParStatut['ANNULEE'] || 0,
    },
  };
};

// ─────────────────────────────────────────────
// Détail d'une intervention de l'historique
// ─────────────────────────────────────────────

export const getDetailHistorique = async (id_intervention, id_client) => {
  const intervention = await prisma.intervention.findUnique({
    where: { id_intervention },
    include: {
      forfait: true,
      technicien: { select: { nom: true, prenom: true } },
      zone: { select: { nom: true } },
      velo: true,
      inclure: { include: { produit: true } },
      photos: { orderBy: { date_creation: 'asc' } },
    },
  });

  if (!intervention) {
    const error = new Error('Intervention introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (intervention.id_client !== id_client) {
    const error = new Error('Accès refusé');
    error.statusCode = 403;
    throw error;
  }

  return intervention;
};
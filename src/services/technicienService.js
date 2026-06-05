// Sprint 5 — Service Technicien : Interventions
// TECH-01 à TECH-20 : Toutes les actions du technicien sur ses interventions
// Compétence CDA : Développer des composants d'accès aux données SQL
// Compétence CDA : Développer des composants métier
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// TECH-01 : GET ALL — Interventions du technicien connecté
// US-12 : Consultation et modification des interventions
// ─────────────────────────────────────────────

export const getInterventionsTechnicien = async (id_technicien, filtres = {}) => {
  const { page = 1, limit = 20, statut, date_debut, date_fin, date_jour } = filtres;
  const skip = (page - 1) * limit;

  // Construction du filtre WHERE
  const where = {
    id_technicien,
    ...(statut && { statut }),
  };

  // Filtre par jour spécifique (pour la vue "interventions du jour")
  if (date_jour) {
    const debut = new Date(`${date_jour}T00:00:00.000Z`);
    const fin = new Date(`${date_jour}T23:59:59.999Z`);
    where.date_intervention = { gte: debut, lte: fin };
  } else if (date_debut || date_fin) {
    where.date_intervention = {
      ...(date_debut && { gte: new Date(date_debut) }),
      ...(date_fin && { lte: new Date(date_fin) }),
    };
  }

  const [interventions, total] = await Promise.all([
    prisma.intervention.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date_intervention: 'asc' },
      include: {
        client: {
          select: {
            id_client: true,
            nom: true,
            prenom: true,
            telephone: true,
            adresse: true,
            ville: true,
          },
        },
        forfait: {
          select: { nom: true, prix: true, duree_minutes: true, type_velo: true },
        },
        zone: { select: { nom: true } },
        velo: {
          select: { marque: true, modele: true, annee: true, type_velo: true },
        },
        inclure: {
          include: { produit: { select: { nom: true, prix: true } } },
        },
        photos: {
          select: { id_photo: true, url_photo: true, type: true, date_creation: true },
        },
      },
    }),
    prisma.intervention.count({ where }),
  ]);

  return {
    data: interventions,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─────────────────────────────────────────────
// TECH-11 : GET ONE — Détail complet d'une intervention
// US-16 : Consultation détaillée de l'intervention
// ─────────────────────────────────────────────

export const getInterventionDetaillee = async (id_intervention, id_technicien) => {
  const intervention = await prisma.intervention.findFirst({
    where: {
      id_intervention,
      id_technicien, // sécurité : appartenance vérifiée
    },
    include: {
      client: true,
      forfait: true,
      zone: true,
      velo: true,
      technicien: { select: { nom: true, prenom: true, telephone: true } },
      inclure: {
        include: {
          produit: true,
        },
      },
      photos: {
        orderBy: { date_creation: 'asc' },
      },
    },
  });

  if (!intervention) {
    const error = new Error('Intervention introuvable ou non assignée');
    error.statusCode = 404;
    throw error;
  }

  return intervention;
};

// ─────────────────────────────────────────────
// TECH-02 : PUT — Modification de l'intervention (champs limités)
// US-12 : Le technicien modifie commentaire, heures, produits
// ─────────────────────────────────────────────

export const updateInterventionParTechnicien = async (id_intervention, id_technicien, data) => {
  // Vérifie l'appartenance ET le statut
  const existing = await prisma.intervention.findFirst({
    where: { id_intervention, id_technicien },
    select: { statut: true, id_intervention: true },
  });

  if (!existing) {
    const error = new Error('Intervention introuvable ou non assignée');
    error.statusCode = 404;
    throw error;
  }

  // Un technicien ne peut pas modifier une intervention TERMINEE ou ANNULEE
  if (existing.statut === 'TERMINEE' || existing.statut === 'ANNULEE') {
    const error = new Error(
      `Impossible de modifier une intervention avec le statut "${existing.statut}"`
    );
    error.statusCode = 422;
    throw error;
  }

  const { produits, ...champsDircts } = data;

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.intervention.update({
      where: { id_intervention },
      data: {
        ...(champsDircts.commentaire !== undefined && {
          commentaire: champsDircts.commentaire,
        }),
        ...(champsDircts.heure_debut && {
          heure_debut: new Date(champsDircts.heure_debut),
        }),
        ...(champsDircts.heure_fin && {
          heure_fin: new Date(champsDircts.heure_fin),
        }),
        ...(champsDircts.statut !== undefined && { statut: champsDircts.statut }),
      },
    });

    // Mise à jour des produits additionnels (remplacement complet)
    if (produits !== undefined) {
      await tx.inclure.deleteMany({ where: { id_intervention } });
      if (produits.length > 0) {
        await tx.inclure.createMany({
          data: produits.map((p) => ({
            id_intervention,
            id_produit: p.id_produit,
            quantite: p.quantite || 1,
          })),
        });
      }
    }

    return updated;
  });
};

// ─────────────────────────────────────────────
// TECH-15 : Commentaire — US-18
// Endpoint dédié pour écrire/mettre à jour le commentaire uniquement
// ─────────────────────────────────────────────

export const ajouterCommentaire = async (id_intervention, id_technicien, commentaire) => {
  const existing = await prisma.intervention.findFirst({
    where: { id_intervention, id_technicien },
    select: { statut: true },
  });

  if (!existing) {
    const error = new Error('Intervention introuvable ou non assignée');
    error.statusCode = 404;
    throw error;
  }

  if (existing.statut === 'ANNULEE') {
    const error = new Error('Impossible de commenter une intervention annulée');
    error.statusCode = 422;
    throw error;
  }

  return await prisma.intervention.update({
    where: { id_intervention },
    data: { commentaire },
    select: {
      id_intervention: true,
      commentaire: true,
      statut: true,
    },
  });
};

// ─────────────────────────────────────────────
// TECH-17 : Marquer terminée — US-19
// Endpoint dédié : POST /api/tech/interventions/:id/terminer
// ─────────────────────────────────────────────

export const marquerTerminee = async (id_intervention, id_technicien) => {
  const existing = await prisma.intervention.findFirst({
    where: { id_intervention, id_technicien },
    select: { statut: true },
  });

  if (!existing) {
    const error = new Error('Intervention introuvable ou non assignée');
    error.statusCode = 404;
    throw error;
  }

  // US-19 : "coche terminée persiste et non modifiable"
  if (existing.statut === 'TERMINEE') {
    const error = new Error('Cette intervention est déjà marquée comme terminée');
    error.statusCode = 409;
    throw error;
  }

  if (existing.statut === 'ANNULEE') {
    const error = new Error('Impossible de terminer une intervention annulée');
    error.statusCode = 422;
    throw error;
  }

  return await prisma.intervention.update({
    where: { id_intervention },
    data: {
      statut: 'TERMINEE',
      heure_fin: new Date(), // Horodatage automatique de fin
    },
    select: {
      id_intervention: true,
      statut: true,
      heure_fin: true,
      date_intervention: true,
    },
  });
};

// ─────────────────────────────────────────────
// TECH-19 : Annuler — US-20
// Endpoint dédié : POST /api/tech/interventions/:id/annuler
// ─────────────────────────────────────────────

export const annulerIntervention = async (id_intervention, id_technicien, motif) => {
  const existing = await prisma.intervention.findFirst({
    where: { id_intervention, id_technicien },
    select: { statut: true, date_intervention: true },
  });

  if (!existing) {
    const error = new Error('Intervention introuvable ou non assignée');
    error.statusCode = 404;
    throw error;
  }

  // US-20 : impossible d'annuler une intervention déjà terminée
  if (existing.statut === 'TERMINEE') {
    const error = new Error('Impossible d\'annuler une intervention déjà terminée');
    error.statusCode = 422;
    throw error;
  }

  if (existing.statut === 'ANNULEE') {
    const error = new Error('Cette intervention est déjà annulée');
    error.statusCode = 409;
    throw error;
  }

  // Ajoute le motif dans le commentaire si fourni
  const commentaireAnnulation = motif
    ? `[ANNULÉE PAR TECHNICIEN] ${motif}`
    : '[ANNULÉE PAR TECHNICIEN]';

  return await prisma.intervention.update({
    where: { id_intervention },
    data: {
      statut: 'ANNULEE',
      commentaire: commentaireAnnulation,
    },
    select: {
      id_intervention: true,
      statut: true,
      commentaire: true,
      date_intervention: true,
    },
  });
};

// ─────────────────────────────────────────────
// TECH-05 : Planning semaine — US-13
// Regroupe les interventions par jour sur une période
// ─────────────────────────────────────────────

export const getPlanningTechnicienConnecte = async (id_technicien, { date_debut, date_fin }) => {
  // Fenêtre par défaut : semaine en cours (lundi → dimanche)
  const debut = date_debut
    ? new Date(date_debut)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const jour = d.getDay();
        // Lundi = 1, si dimanche (0) on recule à lundi précédent
        d.setDate(d.getDate() - (jour === 0 ? 6 : jour - 1));
        return d;
      })();

  const fin = date_fin
    ? new Date(date_fin)
    : (() => {
        const d = new Date(debut);
        d.setDate(d.getDate() + 6);
        d.setHours(23, 59, 59, 999);
        return d;
      })();

  const interventions = await prisma.intervention.findMany({
    where: {
      id_technicien,
      date_intervention: { gte: debut, lte: fin },
    },
    orderBy: { date_intervention: 'asc' },
    include: {
      client: {
        select: { nom: true, prenom: true, adresse: true, ville: true, telephone: true },
      },
      forfait: { select: { nom: true, duree_minutes: true } },
      zone: { select: { nom: true } },
      velo: { select: { marque: true, modele: true, type_velo: true } },
    },
  });

  // Groupement par jour — format calendrier
  const parJour = interventions.reduce((acc, interv) => {
    const jour = interv.date_intervention.toISOString().split('T')[0];
    if (!acc[jour]) acc[jour] = [];
    acc[jour].push(interv);
    return acc;
  }, {});

  return {
    periode: { debut: debut.toISOString(), fin: fin.toISOString() },
    total: interventions.length,
    parJour,
    interventions,
  };
};
// INTERV-02 : CRUD Interventions
// Compétence CDA : Développer des composants d'accès aux données SQL
// Compétence CDA : Développer des composants métier
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────
// GET ALL — Liste paginée avec filtres
// INTERV-02 : Affichage liste interventions
// ─────────────────────────────────────────────

export const getAllInterventions = async ({
  page = 1,
  limit = 20,
  statut,
  id_technicien,
  id_zone,
  date_debut,
  date_fin,
}) => {
  const skip = (page - 1) * limit;

  // Construction dynamique du filtre WHERE
  const where = {
    ...(statut && { statut }),
    ...(id_technicien && { id_technicien }),
    ...(id_zone && { id_zone }),
    ...(date_debut || date_fin
      ? {
          date_intervention: {
            ...(date_debut && { gte: new Date(date_debut) }),
            ...(date_fin && { lte: new Date(date_fin) }),
          },
        }
      : {}),
  };

  const [interventions, total] = await Promise.all([
    prisma.intervention.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date_intervention: 'asc' },
      include: {
        client: { select: { nom: true, prenom: true, adresse: true, ville: true } },
        technicien: { select: { nom: true, prenom: true } },
        forfait: { select: { nom: true, prix: true, duree_minutes: true } },
        zone: { select: { nom: true } },
        velo: { select: { marque: true, modele: true, type_velo: true } },
        inclure: {
          include: {
            produit: { select: { nom: true, prix: true } },
          },
        },
        photos: { select: { id_photo: true, url_photo: true, type: true } },
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
// GET ONE — Détail complet d'une intervention
// ─────────────────────────────────────────────

export const getInterventionById = async (id) => {
  const intervention = await prisma.intervention.findUnique({
    where: { id_intervention: id },
    include: {
      client: true,
      technicien: true,
      forfait: true,
      zone: true,
      velo: true,
      inclure: { include: { produit: true } },
      photos: true,
    },
  });

  if (!intervention) {
    const error = new Error('Intervention introuvable');
    error.statusCode = 404;
    throw error;
  }

  return intervention;
};

// ─────────────────────────────────────────────
// POST — Création d'une intervention
// ─────────────────────────────────────────────

export const createIntervention = async (data) => {
  const {
    date_intervention,
    heure_debut,
    heure_fin,
    adresse_intervention,
    commentaire,
    id_zone,
    id_technicien,
    id_forfait,
    id_velo,
    id_client,
    produits = [],
  } = data;

  // Calcul automatique du montant si forfait fourni
  let montant = null;
  if (id_forfait) {
    const forfait = await prisma.forfait.findUnique({ where: { id_forfait } });
    if (forfait?.prix) {
      montant = Number(forfait.prix);
      // Ajoute les prix des produits additionnels si fournis
      for (const p of produits) {
        const produit = await prisma.produit.findUnique({ where: { id_produit: p.id_produit } });
        if (produit?.prix) montant += Number(produit.prix) * p.quantite;
      }
    }
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Créer l'intervention
    const intervention = await tx.intervention.create({
      data: {
        date_intervention: new Date(date_intervention),
        heure_debut: heure_debut ? new Date(heure_debut) : null,
        heure_fin: heure_fin ? new Date(heure_fin) : null,
        adresse_intervention,
        commentaire,
        montant,
        id_zone: id_zone || null,
        id_technicien: id_technicien || null,
        id_forfait: id_forfait || null,
        id_velo: id_velo || null,
        id_client: id_client || null,
        statut: 'PLANIFIEE',
      },
    });

    // 2. Associer les produits additionnels (table inclure)
    if (produits.length > 0) {
      await tx.inclure.createMany({
        data: produits.map((p) => ({
          id_intervention: intervention.id_intervention,
          id_produit: p.id_produit,
          quantite: p.quantite || 1,
        })),
      });
    }

    // Retourne l'intervention complète
    return await tx.intervention.findUnique({
      where: { id_intervention: intervention.id_intervention },
      include: {
        client: { select: { nom: true, prenom: true } },
        technicien: { select: { nom: true, prenom: true } },
        forfait: { select: { nom: true, prix: true, duree_minutes: true } },
        zone: { select: { nom: true } },
        inclure: { include: { produit: { select: { nom: true, prix: true } } } },
      },
    });
  });
};

// ─────────────────────────────────────────────
// PUT — Mise à jour d'une intervention
// ─────────────────────────────────────────────

export const updateIntervention = async (id, data) => {
  const existing = await prisma.intervention.findUnique({
    where: { id_intervention: id },
  });

  if (!existing) {
    const error = new Error('Intervention introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Empêche la modification d'une intervention annulée ou terminée depuis > 24h
  if (existing.statut === 'TERMINEE' || existing.statut === 'ANNULEE') {
    const diff = Date.now() - new Date(existing.date_intervention).getTime();
    const heures = diff / (1000 * 60 * 60);
    if (heures > 24) {
      const error = new Error('Une intervention terminée ou annulée ne peut plus être modifiée après 24h');
      error.statusCode = 422;
      throw error;
    }
  }

  const { produits, ...interventionData } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Mettre à jour les champs de l'intervention
    const updated = await tx.intervention.update({
      where: { id_intervention: id },
      data: {
        ...(interventionData.date_intervention && {
          date_intervention: new Date(interventionData.date_intervention),
        }),
        ...(interventionData.heure_debut && {
          heure_debut: new Date(interventionData.heure_debut),
        }),
        ...(interventionData.heure_fin && {
          heure_fin: new Date(interventionData.heure_fin),
        }),
        ...(interventionData.statut !== undefined && { statut: interventionData.statut }),
        ...(interventionData.adresse_intervention !== undefined && {
          adresse_intervention: interventionData.adresse_intervention,
        }),
        ...(interventionData.montant !== undefined && { montant: interventionData.montant }),
        ...(interventionData.commentaire !== undefined && {
          commentaire: interventionData.commentaire,
        }),
        ...(interventionData.id_zone !== undefined && { id_zone: interventionData.id_zone }),
        ...(interventionData.id_technicien !== undefined && {
          id_technicien: interventionData.id_technicien,
        }),
        ...(interventionData.id_forfait !== undefined && {
          id_forfait: interventionData.id_forfait,
        }),
        ...(interventionData.id_velo !== undefined && { id_velo: interventionData.id_velo }),
        ...(interventionData.id_client !== undefined && { id_client: interventionData.id_client }),
      },
    });

    // 2. Remplace les produits si fournis (delete + recreate)
    if (produits !== undefined) {
      await tx.inclure.deleteMany({ where: { id_intervention: id } });
      if (produits.length > 0) {
        await tx.inclure.createMany({
          data: produits.map((p) => ({
            id_intervention: id,
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
// DELETE — Suppression physique d'une intervention
// (pas de soft delete ici : une intervention annulée garde son statut ANNULEE)
// ─────────────────────────────────────────────

export const deleteIntervention = async (id) => {
  const existing = await prisma.intervention.findUnique({
    where: { id_intervention: id },
    include: { inclure: true, photos: true },
  });

  if (!existing) {
    const error = new Error('Intervention introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Sécurité : pas de suppression d'une intervention TERMINEE
  if (existing.statut === 'TERMINEE') {
    const error = new Error(
      'Une intervention terminée ne peut pas être supprimée. Utilisez le statut ANNULEE.'
    );
    error.statusCode = 422;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    // Supprime d'abord les dépendances (clés étrangères)
    await tx.inclure.deleteMany({ where: { id_intervention: id } });
    await tx.photo.deleteMany({ where: { id_intervention: id } });
    return await tx.intervention.delete({ where: { id_intervention: id } });
  });
};

// ─────────────────────────────────────────────
// Stats interventions pour tableau de bord admin
// ─────────────────────────────────────────────

export const getInterventionStats = async () => {
  const [total, parStatut, duMois] = await Promise.all([
    prisma.intervention.count(),
    prisma.intervention.groupBy({
      by: ['statut'],
      _count: { statut: true },
    }),
    prisma.intervention.count({
      where: {
        date_intervention: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    total,
    duMois,
    parStatut: parStatut.reduce((acc, s) => {
      acc[s.statut] = s._count.statut;
      return acc;
    }, {}),
  };
};
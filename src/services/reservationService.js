// RESA-01/02 : Service Réservation côté client
// Compétence CDA : Développer des composants métier + Accès aux données SQL
// US-21 : Créer une réservation (avec ou sans compte)
// US-22 : Annuler une réservation
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// US-21 : Créer une réservation
//
// LOGIQUE MÉTIER :
//   1. Le client sélectionne adresse + forfait + vélo + créneau
//   2. On calcule le montant (forfait + produits)
//   3. On crée l'intervention avec statut PLANIFIEE
//   4. Si pas de compte → l'intervention est créée SANS id_client
//      Le front redirige vers /inscription?id_intervention=xxx (RESA-05)
//   5. Si compte existant → id_client attaché directement
// ─────────────────────────────────────────────

export const createReservation = async (data, id_client = null) => {
  const {
    adresse_intervention,
    code_postal_intervention,
    ville_intervention,
    date_intervention,
    id_forfait,
    id_velo,
    id_zone,
    id_technicien,
    produits = [],
    commentaire,
  } = data;

  // 1. Récupère le forfait pour calculer le montant et valider la durée
  const forfait = await prisma.forfait.findUnique({
    where: { id_forfait },
    select: { id_forfait: true, nom: true, prix: true, duree_minutes: true, actif: true },
  });

  if (!forfait) {
    const error = new Error('Forfait introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (!forfait.actif) {
    const error = new Error('Ce forfait n\'est plus disponible');
    error.statusCode = 410;
    throw error;
  }

  // 2. Calcul du montant total
  let montant = Number(forfait.prix || 0);
  const produitsValides = [];

  for (const p of produits) {
    const produit = await prisma.produit.findUnique({
      where: { id_produit: p.id_produit },
      select: { id_produit: true, prix: true, actif: true, nom: true },
    });
    if (produit && produit.actif) {
      montant += Number(produit.prix || 0) * p.quantite;
      produitsValides.push({ ...p, produit });
    }
  }

  // 3. Vérifie que le vélo appartient bien au client connecté (si compte existant)
  if (id_client && id_velo) {
    const velo = await prisma.velo.findUnique({
      where: { id_velo },
      select: { id_client: true },
    });
    if (!velo || velo.id_client !== id_client) {
      const error = new Error('Ce vélo ne vous appartient pas');
      error.statusCode = 403;
      throw error;
    }
  }

  // 4. Création de l'intervention dans une transaction
  return await prisma.$transaction(async (tx) => {
    const adresseComplete = `${adresse_intervention}, ${code_postal_intervention} ${ville_intervention}`;

    const intervention = await tx.intervention.create({
      data: {
        date_intervention: new Date(date_intervention),
        statut: 'PLANIFIEE',
        adresse_intervention: adresseComplete,
        montant,
        commentaire: commentaire || null,
        id_forfait,
        id_velo: id_velo || null,
        id_client: id_client || null,       // null si pas encore de compte
        id_zone: id_zone || null,
        id_technicien: id_technicien || null,
      },
    });

    // 5. Associe les produits additionnels
    if (produitsValides.length > 0) {
      await tx.inclure.createMany({
        data: produitsValides.map((p) => ({
          id_intervention: intervention.id_intervention,
          id_produit: p.id_produit,
          quantite: p.quantite,
        })),
      });
    }

    // Retourne la réservation complète
    return await tx.intervention.findUnique({
      where: { id_intervention: intervention.id_intervention },
      include: {
        forfait: { select: { nom: true, prix: true, duree_minutes: true } },
        inclure: { include: { produit: { select: { nom: true, prix: true } } } },
        zone: { select: { nom: true } },
      },
    });
  });
};

// ─────────────────────────────────────────────
// US-22 : Annuler une réservation (côté client)
// ─────────────────────────────────────────────

export const annulerReservationClient = async (id_intervention, id_client, motif) => {
  // Vérifie que la réservation appartient au client
  const intervention = await prisma.intervention.findUnique({
    where: { id_intervention },
    select: { id_client: true, statut: true, date_intervention: true },
  });

  if (!intervention) {
    const error = new Error('Réservation introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (intervention.id_client !== id_client) {
    const error = new Error('Cette réservation ne vous appartient pas');
    error.statusCode = 403;
    throw error;
  }

  // Impossible d'annuler une réservation déjà terminée
  if (intervention.statut === 'TERMINEE') {
    const error = new Error('Impossible d\'annuler une intervention déjà terminée');
    error.statusCode = 422;
    throw error;
  }

  if (intervention.statut === 'ANNULEE') {
    const error = new Error('Cette réservation est déjà annulée');
    error.statusCode = 409;
    throw error;
  }

  // Commentaire d'annulation tracé
  const commentaireAnnulation = motif
    ? `[ANNULÉE PAR CLIENT] ${motif}`
    : '[ANNULÉE PAR CLIENT]';

  return await prisma.intervention.update({
    where: { id_intervention },
    data: {
      statut: 'ANNULEE',
      commentaire: commentaireAnnulation,
    },
    select: {
      id_intervention: true,
      statut: true,
      date_intervention: true,
      commentaire: true,
    },
  });
};

// ─────────────────────────────────────────────
// RESA-06 : Liste des réservations du client
// ─────────────────────────────────────────────

export const getReservationsClient = async (id_client, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [reservations, total] = await Promise.all([
    prisma.intervention.findMany({
      where: { id_client },
      skip,
      take: limit,
      orderBy: { date_intervention: 'desc' },
      include: {
        forfait: { select: { nom: true, prix: true, duree_minutes: true } },
        technicien: { select: { nom: true, prenom: true } },
        zone: { select: { nom: true } },
        velo: { select: { marque: true, modele: true, type_velo: true } },
        inclure: {
          include: { produit: { select: { nom: true, prix: true } } },
        },
        photos: { select: { url_photo: true, type: true } },
      },
    }),
    prisma.intervention.count({ where: { id_client } }),
  ]);

  return {
    data: reservations,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─────────────────────────────────────────────
// Détail d'une réservation (US-22 : RESA-06)
// ─────────────────────────────────────────────

export const getReservationDetail = async (id_intervention, id_client) => {
  const intervention = await prisma.intervention.findUnique({
    where: { id_intervention },
    include: {
      forfait: true,
      technicien: { select: { nom: true, prenom: true, telephone: true } },
      zone: { select: { nom: true } },
      velo: true,
      inclure: { include: { produit: true } },
      photos: true,
    },
  });

  if (!intervention) {
    const error = new Error('Réservation introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (intervention.id_client !== id_client) {
    const error = new Error('Accès refusé à cette réservation');
    error.statusCode = 403;
    throw error;
  }

  return intervention;
};

// ─────────────────────────────────────────────
// Rattache une intervention temporaire à un client
// appelé après finalisation de l'inscription (RESA-05/09)
// ─────────────────────────────────────────────

export const rattacherInterventionAuClient = async (id_intervention, id_client) => {
  const intervention = await prisma.intervention.findUnique({
    where: { id_intervention },
    select: { id_client: true, statut: true },
  });

  if (!intervention) {
    const error = new Error('Réservation introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Si déjà rattachée à un autre client, erreur
  if (intervention.id_client && intervention.id_client !== id_client) {
    const error = new Error('Cette réservation appartient déjà à un autre compte');
    error.statusCode = 409;
    throw error;
  }

  return await prisma.intervention.update({
    where: { id_intervention },
    data: { id_client },
    select: {
      id_intervention: true,
      id_client: true,
      statut: true,
      date_intervention: true,
    },
  });
};
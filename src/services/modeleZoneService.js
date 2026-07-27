// PLAN-05 : Service Association Modèle ↔ Zone géographique
// US-28 : Associer un modèle à une zone avec temps de déplacement
// Compétence CDA : Développer des composants d'accès aux données SQL
import { prisma } from '../lib/prisma.js';
import { datetimeToHeure } from './modelePlanifService.js';

// ─────────────────────────────────────────────
// GET ALL — Associations modèle-zone d'un modèle donné
// PLAN-06 : UI association zone ↔ modèle
// ─────────────────────────────────────────────

export const getModeleZones = async (id_modele_planification) => {
  // Vérifie que le modèle existe
  const modele = await prisma.modele_planification.findUnique({
    where: { id_modele_planification },
    select: { id_modele_planification: true, nom: true },
  });

  if (!modele) {
    const error = new Error('Modèle de planification introuvable');
    error.statusCode = 404;
    throw error;
  }

  const associations = await prisma.modele_zone.findMany({
    where: { id_modele_planification },
    include: {
      zone: {
        select: {
          id_zone: true,
          nom: true,
          description: true,
          frais_deplacement: true,
        },
      },
    },
    orderBy: { zone: { nom: 'asc' } },
  });

  return {
    modele,
    associations,
  };
};

// ─────────────────────────────────────────────
// GET ALL — Toutes les associations (vue globale admin)
// ─────────────────────────────────────────────

export const getAllModeleZones = async () => {
  return await prisma.modele_zone.findMany({
    include: {
      zone: { select: { id_zone: true, nom: true } },
      modele_planification: {
        select: { id_modele_planification: true, nom: true, actif: true },
      },
    },
    orderBy: [
      { modele_planification: { nom: 'asc' } },
      { zone: { nom: 'asc' } },
    ],
  });
};

// ─────────────────────────────────────────────
// POST — Créer une association modèle ↔ zone
// Avec buffer_deplacement et max_intervention_jour
// ─────────────────────────────────────────────

export const createModeleZone = async (data) => {
  const { id_modele_planification, id_zone, buffer_deplacement, max_intervention_jour } = data;

  // Vérifie que le modèle et la zone existent
  const [modele, zone] = await Promise.all([
    prisma.modele_planification.findUnique({
      where: { id_modele_planification },
      select: { id_modele_planification: true, nom: true, heure_debut: true, heure_fin: true, duree_pause: true },
    }),
    prisma.zone.findUnique({
      where: { id_zone },
      select: { id_zone: true, nom: true },
    }),
  ]);

  if (!modele) {
    const error = new Error('Modèle de planification introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (!zone) {
    const error = new Error('Zone géographique introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Vérifie que cette association n'existe pas déjà
  const existing = await prisma.modele_zone.findFirst({
    where: { id_modele_planification, id_zone },
  });

  if (existing) {
    const error = new Error(
      `Le modèle "${modele.nom}" est déjà associé à la zone "${zone.nom}"`
    );
    error.statusCode = 409;
    throw error;
  }

  // Validation métier : vérifie la cohérence buffer vs durée journée
  const hDebut = new Date(modele.heure_debut);
  const hFin = new Date(modele.heure_fin);
  const dureeJourneeMinutes =
    (hFin.getHours() * 60 + hFin.getMinutes()) -
    (hDebut.getHours() * 60 + hDebut.getMinutes()) -
    modele.duree_pause;

  // Un buffer trop grand rendrait les créneaux impossibles
  if (buffer_deplacement >= dureeJourneeMinutes) {
    const error = new Error(
      `Le temps de déplacement (${buffer_deplacement} min) est trop élevé pour ce modèle (durée utile : ${dureeJourneeMinutes} min)`
    );
    error.statusCode = 422;
    throw error;
  }

  return await prisma.modele_zone.create({
    data: {
      id_modele_planification,
      id_zone,
      buffer_deplacement,
      max_intervention_jour,
    },
    include: {
      zone: { select: { id_zone: true, nom: true } },
      modele_planification: { select: { nom: true } },
    },
  });
};

// ─────────────────────────────────────────────
// PUT — Modifier une association (buffer ou max)
// ─────────────────────────────────────────────

export const updateModeleZone = async (id, data) => {
  const assoc = await prisma.modele_zone.findUnique({
    where: { id_modele_zone: id },
  });

  if (!assoc) {
    const error = new Error('Association modèle-zone introuvable');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.modele_zone.update({
    where: { id_modele_zone: id },
    data: {
      ...(data.buffer_deplacement !== undefined && {
        buffer_deplacement: data.buffer_deplacement,
      }),
      ...(data.max_intervention_jour !== undefined && {
        max_intervention_jour: data.max_intervention_jour,
      }),
    },
    include: {
      zone: { select: { nom: true } },
      modele_planification: { select: { nom: true } },
    },
  });
};

// ─────────────────────────────────────────────
// DELETE — Supprimer une association
// ─────────────────────────────────────────────

export const deleteModeleZone = async (id) => {
  const assoc = await prisma.modele_zone.findUnique({
    where: { id_modele_zone: id },
  });

  if (!assoc) {
    const error = new Error('Association modèle-zone introuvable');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.modele_zone.delete({ where: { id_modele_zone: id } });
};

// ─────────────────────────────────────────────
// Récupère la config zone pour un modèle et une zone donnés
// Utilisé par le moteur de génération de créneaux (US-31)
// ─────────────────────────────────────────────

export const getConfigZone = async (id_modele_planification, id_zone) => {
  const config = await prisma.modele_zone.findFirst({
    where: { id_modele_planification, id_zone },
    include: {
      zone: { select: { nom: true } },
      modele_planification: true,
    },
  });

  return config;
};
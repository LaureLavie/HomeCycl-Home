// INTERV-07 : CRU Forfaits (tarifs des interventions)
// Compétence CDA : Développer des composants d'accès aux données SQL
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────
// GET ALL — Liste des forfaits actifs (+ inactifs pour l'admin)
// ─────────────────────────────────────────────

export const getAllForfaits = async ({ actifSeulement = false } = {}) => {
  return await prisma.forfait.findMany({
    where: actifSeulement ? { actif: true } : {},
    orderBy: [{ type_velo: 'asc' }, { prix: 'asc' }],
    include: {
      // Compte les interventions associées (utile pour l'UI admin)
      _count: { select: { interventions: true } },
    },
  });
};

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────

export const getForfaitById = async (id) => {
  const forfait = await prisma.forfait.findUnique({
    where: { id_forfait: id },
    include: { _count: { select: { interventions: true } } },
  });

  if (!forfait) {
    const error = new Error('Forfait introuvable');
    error.statusCode = 404;
    throw error;
  }

  return forfait;
};

// ─────────────────────────────────────────────
// POST — Création d'un forfait
// ─────────────────────────────────────────────

export const createForfait = async (data) => {
  // Vérifie l'unicité du nom
  const existing = await prisma.forfait.findFirst({
    where: { nom: { equals: data.nom, mode: 'insensitive' } },
  });

  if (existing) {
    const error = new Error(`Un forfait nommé "${data.nom}" existe déjà`);
    error.statusCode = 409;
    throw error;
  }

  return await prisma.forfait.create({ data });
};

// ─────────────────────────────────────────────
// PUT — Mise à jour d'un forfait (INTERV-09 : bouton sauvegarde)
// ─────────────────────────────────────────────

export const updateForfait = async (id, data) => {
  const forfait = await prisma.forfait.findUnique({ where: { id_forfait: id } });

  if (!forfait) {
    const error = new Error('Forfait introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Vérifie l'unicité du nom si changé
  if (data.nom && data.nom !== forfait.nom) {
    const existing = await prisma.forfait.findFirst({
      where: {
        nom: { equals: data.nom, mode: 'insensitive' },
        id_forfait: { not: id },
      },
    });
    if (existing) {
      const error = new Error(`Un forfait nommé "${data.nom}" existe déjà`);
      error.statusCode = 409;
      throw error;
    }
  }

  return await prisma.forfait.update({
    where: { id_forfait: id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.prix !== undefined && { prix: data.prix }),
      ...(data.duree_minutes !== undefined && { duree_minutes: data.duree_minutes }),
      ...(data.type_velo !== undefined && { type_velo: data.type_velo }),
      ...(data.actif !== undefined && { actif: data.actif }),
    },
  });
};

// ─────────────────────────────────────────────
// Désactivation (pas de suppression physique si des interventions existent)
// ─────────────────────────────────────────────

export const deactivateForfait = async (id) => {
  const forfait = await prisma.forfait.findUnique({
    where: { id_forfait: id },
    include: { _count: { select: { interventions: true } } },
  });

  if (!forfait) {
    const error = new Error('Forfait introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Suppression physique uniquement si aucune intervention liée
  if (forfait._count.interventions === 0) {
    return await prisma.forfait.delete({ where: { id_forfait: id } });
  }

  // Sinon désactivation soft
  return await prisma.forfait.update({
    where: { id_forfait: id },
    data: { actif: false },
  });
};
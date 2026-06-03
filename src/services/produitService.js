// INTERV-12 : CRU Produits additionnels
// Compétence CDA : Développer des composants d'accès aux données SQL
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// GET ALL — Liste des produits
// ─────────────────────────────────────────────

export const getAllProduits = async ({ actifSeulement = false } = {}) => {
  return await prisma.produit.findMany({
    where: actifSeulement ? { actif: true } : {},
    orderBy: { nom: 'asc' },
    include: {
      _count: { select: { inclure: true } }, // nb d'utilisations dans des interventions
    },
  });
};

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────

export const getProduitById = async (id) => {
  const produit = await prisma.produit.findUnique({
    where: { id_produit: id },
    include: { _count: { select: { inclure: true } } },
  });

  if (!produit) {
    const error = new Error('Produit introuvable');
    error.statusCode = 404;
    throw error;
  }

  return produit;
};

// ─────────────────────────────────────────────
// POST — Création
// ─────────────────────────────────────────────

export const createProduit = async (data) => {
  const existing = await prisma.produit.findFirst({
    where: { nom: { equals: data.nom, mode: 'insensitive' } },
  });

  if (existing) {
    const error = new Error(`Un produit nommé "${data.nom}" existe déjà`);
    error.statusCode = 409;
    throw error;
  }

  return await prisma.produit.create({ data });
};

// ─────────────────────────────────────────────
// PUT — Mise à jour (INTERV-14 : bouton sauvegarde)
// ─────────────────────────────────────────────

export const updateProduit = async (id, data) => {
  const produit = await prisma.produit.findUnique({ where: { id_produit: id } });

  if (!produit) {
    const error = new Error('Produit introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (data.nom && data.nom !== produit.nom) {
    const existing = await prisma.produit.findFirst({
      where: {
        nom: { equals: data.nom, mode: 'insensitive' },
        id_produit: { not: id },
      },
    });
    if (existing) {
      const error = new Error(`Un produit nommé "${data.nom}" existe déjà`);
      error.statusCode = 409;
      throw error;
    }
  }

  return await prisma.produit.update({
    where: { id_produit: id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.prix !== undefined && { prix: data.prix }),
      ...(data.actif !== undefined && { actif: data.actif }),
    },
  });
};

// ─────────────────────────────────────────────
// Désactivation (soft si utilisé dans des interventions)
// ─────────────────────────────────────────────

export const deactivateProduit = async (id) => {
  const produit = await prisma.produit.findUnique({
    where: { id_produit: id },
    include: { _count: { select: { inclure: true } } },
  });

  if (!produit) {
    const error = new Error('Produit introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (produit._count.inclure === 0) {
    return await prisma.produit.delete({ where: { id_produit: id } });
  }

  return await prisma.produit.update({
    where: { id_produit: id },
    data: { actif: false },
  });
};
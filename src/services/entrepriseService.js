// ENT-02 : CRUD informations entreprise
// Compétence CDA : Développer des composants d'accès aux données SQL
// Compétence CDA : Développer des composants métier
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// ENT-02 : GET — Récupère les infos de l'entreprise
// L'entreprise est unique (table = 1 seule ligne "Le Cycle Lyonnais")
// ─────────────────────────────────────────────

export const getEntreprise = async () => {
  // findFirst car il n'y a qu'une seule entrée entreprise dans le MVP
  const entreprise = await prisma.entreprise.findFirst({
    orderBy: { date_creation: 'asc' },
  });

  // Si aucune entrée n'existe encore, on retourne null (le front affichera le formulaire vide)
  return entreprise;
};

// ─────────────────────────────────────────────
// ENT-02 : POST — Crée les informations de l'entreprise (premier setup)
// ─────────────────────────────────────────────

export const createEntreprise = async (data) => {
  // Vérifie qu'une entreprise n'existe pas déjà
  const existing = await prisma.entreprise.findFirst();

  if (existing) {
    const error = new Error(
      'Une entreprise existe déjà. Utilisez la mise à jour (PUT) pour modifier.'
    );
    error.statusCode = 409;
    throw error;
  }

  return await prisma.entreprise.create({ data });
};

// ─────────────────────────────────────────────
// ENT-02 : PUT — Mise à jour des infos de l'entreprise (ENT-04 : sauvegarde manuelle)
// ─────────────────────────────────────────────

export const updateEntreprise = async (id, data) => {
  const entreprise = await prisma.entreprise.findUnique({
    where: { id_entreprise: id },
  });

  if (!entreprise) {
    const error = new Error('Entreprise introuvable');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.entreprise.update({
    where: { id_entreprise: id },
    data,
  });
};

// ─────────────────────────────────────────────
// Upsert : crée OU met à jour selon l'existence
// Pratique pour le formulaire front (un seul bouton "Sauvegarder")
// ─────────────────────────────────────────────

export const upsertEntreprise = async (data) => {
  const existing = await prisma.entreprise.findFirst();

  if (existing) {
    return await prisma.entreprise.update({
      where: { id_entreprise: existing.id_entreprise },
      data,
    });
  }

  return await prisma.entreprise.create({ data });
};
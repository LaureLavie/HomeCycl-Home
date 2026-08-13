// CONTACT-01 : Service métier — messages du formulaire de contact
// Compétence CDA : Développer des composants d'accès aux données SQL
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// POST — Enregistre un nouveau message
// ─────────────────────────────────────────────

export const createMessage = async (data) => {
  return await prisma.messageContact.create({ data });
};

// ─────────────────────────────────────────────
// GET ALL — Liste paginée (réservé à une future vue admin, hors périmètre
// immédiat, mais posé ici pour rester cohérent avec le reste du CRUD projet)
// ─────────────────────────────────────────────

export const getAllMessages = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.messageContact.findMany({
      skip,
      take: limit,
      orderBy: { date_creation: 'desc' },
    }),
    prisma.messageContact.count(),
  ]);

  return {
    data: messages,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─────────────────────────────────────────────
// PATCH — Marque un message comme traité (future vue admin)
// ─────────────────────────────────────────────

export const marquerTraite = async (id) => {
  const message = await prisma.messageContact.findUnique({ where: { id_message: id } });

  if (!message) {
    const error = new Error('Message introuvable');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.messageContact.update({
    where: { id_message: id },
    data: { traite: true },
  });
};
// CLIENT-02 : RU informations clients (vue Admin)
// Compétence CDA : Développer des composants d'accès aux données SQL
// Note : R = Read (lecture), U = Update (mise à jour)
// La création client passe par le signup (US-02)
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────
// CLIENT-02 : GET ALL — Liste paginée des clients avec recherche
// ─────────────────────────────────────────────

export const getAllClients = async ({ page = 1, limit = 20, search = '' }) => {
  const skip = (page - 1) * limit;

  const whereSearch = search
    ? {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
          { ville: { contains: search, mode: 'insensitive' } },
          { authentification: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where: whereSearch,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
      include: {
        authentification: {
          select: {
            email: true,
            actif: true,
            date_creation: true,
          },
        },
        // Nombre de vélos du client
        velos: {
          select: { id_velo: true },
        },
        // Dernière intervention
        interventions: {
          select: {
            id_intervention: true,
            date_intervention: true,
            statut: true,
          },
          orderBy: { date_intervention: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.client.count({ where: whereSearch }),
  ]);

  return {
    data: clients,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────
// CLIENT-02 : GET ONE — Détail complet d'un client
// ─────────────────────────────────────────────

export const getClientById = async (id) => {
  const client = await prisma.client.findUnique({
    where: { id_client: id },
    include: {
      authentification: {
        select: {
          email: true,
          actif: true,
          date_creation: true,
          date_modification: true,
        },
      },
      velos: {
        orderBy: { date_creation: 'desc' },
      },
      interventions: {
        include: {
          forfait: { select: { nom: true, prix: true } },
          technicien: { select: { nom: true, prenom: true } },
        },
        orderBy: { date_intervention: 'desc' },
      },
    },
  });

  if (!client) {
    const error = new Error('Client introuvable');
    error.statusCode = 404;
    throw error;
  }

  return client;
};

// ─────────────────────────────────────────────
// CLIENT-02 : PUT — Mise à jour des infos client par l'admin
// ─────────────────────────────────────────────

export const updateClient = async (id, data) => {
  const client = await prisma.client.findUnique({
    where: { id_client: id },
  });

  if (!client) {
    const error = new Error('Client introuvable');
    error.statusCode = 404;
    throw error;
  }

  const { nom, prenom, telephone, adresse, code_postal, ville } = data;

  return await prisma.client.update({
    where: { id_client: id },
    data: {
      ...(nom !== undefined && { nom }),
      ...(prenom !== undefined && { prenom }),
      ...(telephone !== undefined && { telephone }),
      ...(adresse !== undefined && { adresse }),
      ...(code_postal !== undefined && { code_postal }),
      ...(ville !== undefined && { ville }),
    },
    include: {
      authentification: {
        select: { email: true, actif: true },
      },
    },
  });
};

// ─────────────────────────────────────────────
// Stats clients pour le tableau de bord admin
// ─────────────────────────────────────────────

export const getClientStats = async () => {
  const [total, avecVelo, avecIntervention] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({
      where: { velos: { some: {} } },
    }),
    prisma.client.count({
      where: { interventions: { some: {} } },
    }),
  ]);

  return {
    total,
    avecVelo,
    sansVelo: total - avecVelo,
    avecIntervention,
  };
};
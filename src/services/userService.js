// USER-02 : CRU informations utilisateurs (vue Admin)
// Compétence CDA : Développer des composants d'accès aux données SQL
// Compétence CDA : Développer des composants métier
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../utils/auth.js';

// ─────────────────────────────────────────────
// USER-02 : GET ALL — Liste paginée de tous les utilisateurs
// ─────────────────────────────────────────────

export const getAllUsers = async ({ page = 1, limit = 20, search = '' }) => {
  const skip = (page - 1) * limit;

  // Filtre de recherche sur email, nom ou prénom
  const whereSearch = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { client: { nom: { contains: search, mode: 'insensitive' } } },
          { client: { prenom: { contains: search, mode: 'insensitive' } } },
          { technicien: { nom: { contains: search, mode: 'insensitive' } } },
          { technicien: { prenom: { contains: search, mode: 'insensitive' } } },
          { administrateur: { nom: { contains: search, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.authentification.findMany({
      where: whereSearch,
      skip,
      take: limit,
      orderBy: { date_creation: 'desc' },
      select: {
        id_authentification: true,
        email: true,
        Role: true,
        actif: true,
        date_creation: true,
        date_modification: true,
        client: {
          select: {
            id_client: true,
            nom: true,
            prenom: true,
            telephone: true,
            ville: true,
          },
        },
        technicien: {
          select: {
            id_technicien: true,
            nom: true,
            prenom: true,
            telephone: true,
          },
        },
        administrateur: {
          select: {
            id_administrateur: true,
            nom: true,
          },
        },
      },
    }),
    prisma.authentification.count({ where: whereSearch }),
  ]);

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────────
// USER-02 : GET ONE — Détail d'un utilisateur
// ─────────────────────────────────────────────

export const getUserById = async (id) => {
  const user = await prisma.authentification.findUnique({
    where: { id_authentification: id },
    select: {
      id_authentification: true,
      email: true,
      Role: true,
      actif: true,
      date_creation: true,
      date_modification: true,
      client: true,
      technicien: true,
      administrateur: true,
    },
  });

  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// ─────────────────────────────────────────────
// USER-02 : POST — Création d'un utilisateur par l'admin
// (technicien ou autre admin — le client crée son propre compte via signup)
// ─────────────────────────────────────────────

export const createUserByAdmin = async (data) => {
  const { email, mot_passe, role, nom, prenom, telephone, adresse, code_postal, ville } = data;

  // Vérifie l'unicité de l'email
  const existing = await prisma.authentification.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Cette adresse email est déjà utilisée');
    error.statusCode = 409;
    throw error;
  }

  const mot_passe_hash = await hashPassword(mot_passe);

  return await prisma.$transaction(async (tx) => {
    const auth = await tx.authentification.create({
      data: { email, mot_passe_hash, Role: role },
    });

    if (role === 'CLIENT') {
      await tx.client.create({
        data: {
          nom,
          prenom,
          telephone,
          adresse: adresse || '',
          code_postal: code_postal || '',
          ville: ville || '',
          id_authentification: auth.id_authentification,
        },
      });
    } else if (role === 'TECHNICIEN') {
      await tx.technicien.create({
        data: {
          nom,
          prenom,
          telephone: telephone || '',
          id_authentification: auth.id_authentification,
        },
      });
    } else if (role === 'ADMIN') {
      await tx.administrateur.create({
        data: { nom, id_authentification: auth.id_authentification },
      });
    }

    return await tx.authentification.findUnique({
      where: { id_authentification: auth.id_authentification },
      select: {
        id_authentification: true,
        email: true,
        Role: true,
        actif: true,
        date_creation: true,
        client: { select: { nom: true, prenom: true } },
        technicien: { select: { nom: true, prenom: true } },
        administrateur: { select: { nom: true } },
      },
    });
  });
};

// ─────────────────────────────────────────────
// USER-02 : PUT — Mise à jour d'un utilisateur par l'admin
// ─────────────────────────────────────────────

export const updateUserById = async (id, data) => {
  const user = await prisma.authentification.findUnique({
    where: { id_authentification: id },
    include: { client: true, technicien: true, administrateur: true },
  });

  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.statusCode = 404;
    throw error;
  }

  const { nom, prenom, telephone, adresse, code_postal, ville, actif } = data;

  return await prisma.$transaction(async (tx) => {
    // Mise à jour du statut actif si fourni
    if (actif !== undefined) {
      await tx.authentification.update({
        where: { id_authentification: id },
        data: { actif },
      });
    }

    // Mise à jour du profil selon le rôle
    if (user.Role === 'CLIENT' && user.client) {
      return await tx.client.update({
        where: { id_authentification: id },
        data: {
          ...(nom !== undefined && { nom }),
          ...(prenom !== undefined && { prenom }),
          ...(telephone !== undefined && { telephone }),
          ...(adresse !== undefined && { adresse }),
          ...(code_postal !== undefined && { code_postal }),
          ...(ville !== undefined && { ville }),
        },
      });
    }

    if (user.Role === 'TECHNICIEN' && user.technicien) {
      return await tx.technicien.update({
        where: { id_authentification: id },
        data: {
          ...(nom !== undefined && { nom }),
          ...(prenom !== undefined && { prenom }),
          ...(telephone !== undefined && { telephone }),
        },
      });
    }

    if (user.Role === 'ADMIN' && user.administrateur) {
      return await tx.administrateur.update({
        where: { id_authentification: id },
        data: { ...(nom !== undefined && { nom }) },
      });
    }
  });
};

// ─────────────────────────────────────────────
// Soft delete — désactivation (pas de suppression physique, RGPD)
// ─────────────────────────────────────────────

export const deactivateUser = async (id) => {
  const user = await prisma.authentification.findUnique({
    where: { id_authentification: id },
  });

  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.authentification.update({
    where: { id_authentification: id },
    data: { actif: false },
    select: {
      id_authentification: true,
      email: true,
      Role: true,
      actif: true,
    },
  });
};

// ─────────────────────────────────────────────
// Statistiques pour le tableau de bord admin
// ─────────────────────────────────────────────

export const getUserStats = async () => {
  const [total, parRole, actifs] = await Promise.all([
    prisma.authentification.count(),
    prisma.authentification.groupBy({
      by: ['Role'],
      _count: { Role: true },
    }),
    prisma.authentification.count({ where: { actif: true } }),
  ]);

  return {
    total,
    actifs,
    inactifs: total - actifs,
    parRole: parRole.reduce((acc, r) => {
      acc[r.Role] = r._count.Role;
      return acc;
    }, {}),
  };
};
// AUTH-01 à AUTH-07 : Service métier d'authentification
// Compétence CDA : Développer des composants métier + Accès aux données SQL
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

// ─────────────────────────────────────────────
// US-02 : Création de compte selon rôle
// ─────────────────────────────────────────────
/**
 * Inscrit un nouvel utilisateur avec création du profil lié à son rôle.
 * Utilise une transaction Prisma pour garantir l'atomicité :
 * si la création du profil échoue, l'entrée authentification est annulée.
 */
export const registerUser = async (data) => {
  const { email, mot_passe, role, nom, prenom, telephone, adresse, code_postal, ville } = data;

  // Vérifie si l'email est déjà utilisé (AUTH-04 : gestion erreur front)
  const existingUser = await prisma.authentification.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Cette adresse email est déjà utilisée');
    error.statusCode = 409; // Conflict
    throw error;
  }

  // Hash du mot de passe (AUTH-02)
  const mot_passe_hash = await hashPassword(mot_passe);

  // Transaction : création atomique authentification + profil
  const newUser = await prisma.$transaction(async (tx) => {
    // 1. Créer l'entrée d'authentification
    const auth = await tx.authentification.create({
      data: {
        email,
        mot_passe_hash,
        Role: role,
      },
    });

    // 2. Créer le profil selon le rôle
    if (role === 'CLIENT') {
      if (!adresse || !code_postal || !ville) {
        throw new Error("L'adresse, le code postal et la ville sont obligatoires pour un client");
      }
      await tx.client.create({
        data: {
          nom,
          prenom,
          telephone,
          adresse,
          code_postal,
          ville,
          id_authentification: auth.id_authentification,
        },
      });
    } else if (role === 'TECHNICIEN') {
      if (!telephone) {
        throw new Error('Le téléphone est obligatoire pour un technicien');
      }
      await tx.technicien.create({
        data: {
          nom,
          prenom,
          telephone,
          id_authentification: auth.id_authentification,
        },
      });
    } else if (role === 'ADMIN') {
      await tx.administrateur.create({
        data: {
          nom,
          id_authentification: auth.id_authentification,
        },
      });
    }

    return auth;
  });

  // AUTH-08 : connexion automatique après inscription — génère le token
  const token = generateToken(newUser);

  return {
    token,
    user: {
      id: newUser.id_authentification,
      email: newUser.email,
      role: newUser.Role,
    },
  };
};

// ─────────────────────────────────────────────
// US-03 : Connexion
// ─────────────────────────────────────────────

/**
 * Connecte un utilisateur par email/mot de passe.
 * Retourne un JWT et les infos publiques de l'utilisateur.
 */
export const loginUser = async (email, mot_passe) => {
  // Récupère l'utilisateur avec son profil selon le rôle
  const user = await prisma.authentification.findUnique({
    where: { email },
    include: {
      client: { select: { id_client: true, nom: true, prenom: true } },
      technicien: { select: { id_technicien: true, nom: true, prenom: true } },
      administrateur: { select: { id_administrateur: true, nom: true } },
    },
  });

  // Message générique volontaire — ne pas révéler si l'email existe
  if (!user) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  // Vérifie que le compte est actif
  if (!user.actif) {
    const error = new Error('Ce compte a été désactivé. Contactez l\'administrateur.');
    error.statusCode = 403;
    throw error;
  }

  // Vérifie le mot de passe
  const isPasswordValid = await comparePassword(mot_passe, user.mot_passe_hash);
  if (!isPasswordValid) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  // Génère le JWT (AUTH-05)
  const token = generateToken(user);

  // Construit le profil selon le rôle
  const profil = user.client || user.technicien || user.administrateur;

  return {
    token,
    user: {
      id: user.id_authentification,
      email: user.email,
      role: user.Role,
      nom: profil?.nom ?? null,
      prenom: profil?.prenom ?? null,
    },
  };
};

// ─────────────────────────────────────────────
// US-03 : Déconnexion
// AUTH-07 : Logout (invalidation côté serveur via blacklist en mémoire)
// ─────────────────────────────────────────────

// Blacklist en mémoire (suffisant pour MVP — à remplacer par Redis en production)
const tokenBlacklist = new Set();

/**
 * Ajoute le token à la blacklist pour l'invalider.
 * En production : utiliser Redis avec TTL = expiration du token.
 */
export const logoutUser = (token) => {
  tokenBlacklist.add(token);
};

/**
 * Vérifie si un token a été révoqué (déconnexion)
 */
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// ─────────────────────────────────────────────
// ADMIN : Récupérer tous les utilisateurs
// ─────────────────────────────────────────────

export const getAllUsers = async () => {
  return await prisma.authentification.findMany({
    select: {
      id_authentification: true,
      email: true,
      Role: true,
      actif: true,
      date_creation: true,
      client: { select: { nom: true, prenom: true, ville: true } },
      technicien: { select: { nom: true, prenom: true } },
      administrateur: { select: { nom: true } },
    },
    orderBy: { date_creation: 'desc' },
  });
};

// ─────────────────────────────────────────────
// ADMIN : Supprimer un utilisateur
// ─────────────────────────────────────────────

export const deleteUser = async (id) => {
  return await prisma.authentification.update({
    where: { id_authentification: id },
    data: { actif: false }, // Suppression logique (soft delete) — RGPD friendly
  });
};

// ─────────────────────────────────────────────
// ADMIN/TECHNICIEN : Mettre à jour un utilisateur
// ─────────────────────────────────────────────

export const updateUser = async (id, data) => {
  const user = await prisma.authentification.findUnique({
    where: { id_authentification: id },
    include: { client: true, technicien: true, administrateur: true },
  });

  if (!user) {
    const error = new Error('Utilisateur introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Met à jour le profil selon le rôle
  if (user.Role === 'CLIENT' && user.client) {
    return await prisma.client.update({
      where: { id_authentification: id },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        adresse: data.adresse,
        code_postal: data.code_postal,
        ville: data.ville,
      },
    });
  } else if (user.Role === 'TECHNICIEN' && user.technicien) {
    return await prisma.technicien.update({
      where: { id_authentification: id },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
      },
    });
  } else if (user.Role === 'ADMIN' && user.administrateur) {
    return await prisma.administrateur.update({
      where: { id_authentification: id },
      data: { nom: data.nom },
    });
  }
};

// ─────────────────────────────────────────────
// ADMIN : Créer un technicien (création par admin uniquement)
// ─────────────────────────────────────────────

export const createUserByAdmin = async (data) => {
  // Réutilise registerUser — l'admin peut créer n'importe quel rôle
  return await registerUser(data);
};
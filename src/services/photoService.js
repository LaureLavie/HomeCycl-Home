// Sprint 5 — Service Technicien : Clients + Photos
// Compétence CDA : Développer des composants d'accès aux données SQL
import { prisma } from '../lib/prisma.js';
import { buildPhotoUrl } from '../middlewares/upload.js';

// ═════════════════════════════════════════════
// CLIENTS DU TECHNICIEN — US-14 / US-15
// Un technicien ne voit que les clients de SES interventions
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// TECH-06 : Liste des clients du technicien
// US-14 : Consultation et modification des clients
// ─────────────────────────────────────────────

export const getClientsDuTechnicien = async (id_technicien) => {
  // Récupère les clients distincts via les interventions du technicien
  const interventions = await prisma.intervention.findMany({
    where: {
      id_technicien,
      id_client: { not: null },
    },
    select: {
      client: {
        include: {
          authentification: { select: { email: true, actif: true } },
          velos: { select: { id_velo: true, marque: true, modele: true, type_velo: true } },
          interventions: {
            where: { id_technicien },
            select: { id_intervention: true, date_intervention: true, statut: true },
            orderBy: { date_intervention: 'desc' },
            take: 3,
          },
        },
      },
    },
    distinct: ['id_client'],
    orderBy: { date_intervention: 'desc' },
  });

  // Extrait uniquement les clients (dédupliqués via distinct)
  return interventions
    .map((i) => i.client)
    .filter(Boolean);
};

// ─────────────────────────────────────────────
// TECH-10 : Détail complet d'un client
// US-15 : Consultation détaillée du client
// Vérifie que le client appartient aux interventions du technicien
// ─────────────────────────────────────────────

export const getClientDetailTechnicien = async (id_client, id_technicien) => {
  // Vérifie d'abord que ce client a au moins une intervention avec ce technicien
  const lien = await prisma.intervention.findFirst({
    where: { id_client, id_technicien },
    select: { id_intervention: true },
  });

  if (!lien) {
    const error = new Error('Client introuvable ou non rattaché à vos interventions');
    error.statusCode = 403;
    throw error;
  }

  // Récupère le détail complet
  const client = await prisma.client.findUnique({
    where: { id_client },
    include: {
      authentification: {
        select: { email: true, actif: true, date_creation: true },
      },
      velos: {
        orderBy: { date_creation: 'desc' },
      },
      interventions: {
        where: { id_technicien }, // Filtre : uniquement les interventions de CE technicien
        include: {
          forfait: { select: { nom: true, prix: true, duree_minutes: true } },
          zone: { select: { nom: true } },
          photos: { select: { url_photo: true, type: true } },
        },
        orderBy: { date_intervention: 'desc' },
      },
      photos: {
        select: { id_photo: true, url_photo: true, type: true, date_creation: true },
        orderBy: { date_creation: 'desc' },
        take: 10,
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
// TECH-07 : Modification du client (champs limités)
// US-14 : Le technicien modifie uniquement les infos de contact
// ─────────────────────────────────────────────

export const updateClientParTechnicien = async (id_client, id_technicien, data) => {
  // Vérifie que ce client appartient aux interventions du technicien
  const lien = await prisma.intervention.findFirst({
    where: { id_client, id_technicien },
    select: { id_intervention: true },
  });

  if (!lien) {
    const error = new Error('Client introuvable ou non rattaché à vos interventions');
    error.statusCode = 403;
    throw error;
  }

  const { telephone, adresse, code_postal, ville } = data;

  return await prisma.client.update({
    where: { id_client },
    data: {
      // Champs autorisés pour le technicien (pas de nom/prenom/email)
      ...(telephone !== undefined && { telephone }),
      ...(adresse !== undefined && { adresse }),
      ...(code_postal !== undefined && { code_postal }),
      ...(ville !== undefined && { ville }),
    },
    select: {
      id_client: true,
      nom: true,
      prenom: true,
      telephone: true,
      adresse: true,
      code_postal: true,
      ville: true,
    },
  });
};

// ═════════════════════════════════════════════
// PHOTOS — US-17
// TECH-12/13 : Upload et stockage des photos
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// TECH-13 : Enregistre une photo en BDD après upload Multer
// ─────────────────────────────────────────────

export const enregistrerPhoto = async ({ id_intervention, id_client, fichier, type }) => {
  // Construit l'URL publique
  const url_photo = buildPhotoUrl(id_intervention, fichier.filename);

  return await prisma.photo.create({
    data: {
      type,      // 'AVANT', 'APRES', 'DETAIL'
      url_photo,
      id_intervention: id_intervention || null,
      id_client: id_client || null,
    },
  });
};

// ─────────────────────────────────────────────
// Enregistrement de plusieurs photos à la fois (TECH-12 : import multiple)
// ─────────────────────────────────────────────

export const enregistrerPhotos = async ({ id_intervention, id_client, fichiers, type }) => {
  const photosData = fichiers.map((fichier) => ({
    type,
    url_photo: buildPhotoUrl(id_intervention, fichier.filename),
    id_intervention: id_intervention || null,
    id_client: id_client || null,
  }));

  // Insertion en masse
  await prisma.photo.createMany({ data: photosData });

  // Retourne les photos créées avec leur id (createMany ne retourne pas les records)
  return await prisma.photo.findMany({
    where: {
      id_intervention,
      url_photo: { in: photosData.map((p) => p.url_photo) },
    },
    orderBy: { date_creation: 'desc' },
    take: fichiers.length,
  });
};

// ─────────────────────────────────────────────
// Liste des photos d'une intervention
// ─────────────────────────────────────────────

export const getPhotosIntervention = async (id_intervention, id_technicien) => {
  // Vérifie l'appartenance
  const intervention = await prisma.intervention.findFirst({
    where: { id_intervention, id_technicien },
    select: { id_intervention: true },
  });

  if (!intervention) {
    const error = new Error('Intervention introuvable ou non assignée');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.photo.findMany({
    where: { id_intervention },
    orderBy: { date_creation: 'asc' },
  });
};

// ─────────────────────────────────────────────
// Suppression d'une photo (en cas d'erreur de dépôt)
// ─────────────────────────────────────────────

export const supprimerPhoto = async (id_photo, id_technicien) => {
  const photo = await prisma.photo.findUnique({
    where: { id_photo },
    include: {
      intervention: {
        select: { id_technicien: true, statut: true },
      },
    },
  });

  if (!photo) {
    const error = new Error('Photo introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Vérification appartenance
  if (
    photo.intervention &&
    photo.intervention.id_technicien !== id_technicien
  ) {
    const error = new Error("Vous ne pouvez pas supprimer une photo d'une autre intervention");
    error.statusCode = 403;
    throw error;
  }

  // Pas de suppression du fichier physique pour le MVP
  // (à implémenter avec fs.unlink en évolution future)
  return await prisma.photo.delete({ where: { id_photo } });
};
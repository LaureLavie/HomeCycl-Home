// PLAN-01 : Service Modèle de Planification
// US-27 : Créer un modèle de planification de base
// Compétence CDA : Développer des composants d'accès aux données SQL
// Compétence CDA : Développer des composants métier
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// Utilitaire : convertit "HH:MM" → objet DateTime Prisma
// Prisma stocke DateTime — on utilise une date de référence neutre (01/01/2000)
// car seule l'heure nous intéresse (le front affichera uniquement HH:MM)
// ─────────────────────────────────────────────

const heureToDatetime = (heure) => {
  const [h, m] = heure.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m, 0, 0); // 01/01/2000 HH:MM:00
  return date;
};

// ─────────────────────────────────────────────
// Utilitaire inverse : DateTime Prisma → "HH:MM"
// ─────────────────────────────────────────────

export const datetimeToHeure = (dt) => {
  if (!dt) return null;
  const d = new Date(dt);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// ─────────────────────────────────────────────
// GET ALL — Liste tous les modèles de planification
// PLAN-03 : UI liste des modèles
// ─────────────────────────────────────────────

export const getAllModelePlanification = async ({ actifSeulement = false } = {}) => {
  const modeles = await prisma.modele_planification.findMany({
    where: actifSeulement ? { actif: true } : {},
    orderBy: { nom: 'asc' },
    include: {
      // Zones associées à ce modèle
      modeles_zone: {
        include: {
          zone: {
            select: { id_zone: true, nom: true, frais_deplacement: true },
          },
        },
      },
      // Techniciens affectés
      assigner: {
        include: {
          technicien: {
            select: {
              id_technicien: true,
              nom: true,
              prenom: true,
              telephone: true,
            },
          },
        },
      },
      _count: {
        select: { assigner: true, modeles_zone: true },
      },
    },
  });

  // Formate les heures pour le front
  return modeles.map((m) => ({
    ...m,
    heure_debut: datetimeToHeure(m.heure_debut),
    heure_fin: datetimeToHeure(m.heure_fin),
  }));
};

// ─────────────────────────────────────────────
// GET ONE — Détail d'un modèle
// ─────────────────────────────────────────────

export const getModelePlanificationById = async (id) => {
  const modele = await prisma.modele_planification.findUnique({
    where: { id_modele_planification: id },
    include: {
      modeles_zone: {
        include: {
          zone: true,
        },
      },
      assigner: {
        include: {
          technicien: {
            select: { id_technicien: true, nom: true, prenom: true },
          },
        },
      },
    },
  });

  if (!modele) {
    const error = new Error('Modèle de planification introuvable');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...modele,
    heure_debut: datetimeToHeure(modele.heure_debut),
    heure_fin: datetimeToHeure(modele.heure_fin),
  };
};

// ─────────────────────────────────────────────
// POST — Créer un modèle de planification
// PLAN-02 : UI formulaire création
// ─────────────────────────────────────────────

export const createModelePlanification = async (data) => {
  const { nom, description, heure_debut, heure_fin, duree_pause, actif } = data;

  // Vérifie l'unicité du nom
  const existing = await prisma.modele_planification.findFirst({
    where: { nom: { equals: nom, mode: 'insensitive' } },
  });

  if (existing) {
    const error = new Error(`Un modèle nommé "${nom}" existe déjà`);
    error.statusCode = 409;
    throw error;
  }

  // Calcule la durée totale de la journée en minutes
  const [hD, mD] = heure_debut.split(':').map(Number);
  const [hF, mF] = heure_fin.split(':').map(Number);
  const dureeJourneeMinutes = (hF * 60 + mF) - (hD * 60 + mD);

  if (dureeJourneeMinutes <= duree_pause) {
    const error = new Error('La durée de pause ne peut pas être supérieure ou égale à la durée totale de la journée');
    error.statusCode = 422;
    throw error;
  }

  const modele = await prisma.modele_planification.create({
    data: {
      nom,
      description,
      heure_debut: heureToDatetime(heure_debut),
      heure_fin: heureToDatetime(heure_fin),
      duree_pause,
      actif: actif ?? true,
    },
  });

  return {
    ...modele,
    heure_debut: datetimeToHeure(modele.heure_debut),
    heure_fin: datetimeToHeure(modele.heure_fin),
  };
};

// ─────────────────────────────────────────────
// PUT — Mettre à jour un modèle
// ─────────────────────────────────────────────

export const updateModelePlanification = async (id, data) => {
  const modele = await prisma.modele_planification.findUnique({
    where: { id_modele_planification: id },
  });

  if (!modele) {
    const error = new Error('Modèle de planification introuvable');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.modele_planification.update({
    where: { id_modele_planification: id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.heure_debut !== undefined && {
        heure_debut: heureToDatetime(data.heure_debut),
      }),
      ...(data.heure_fin !== undefined && {
        heure_fin: heureToDatetime(data.heure_fin),
      }),
      ...(data.duree_pause !== undefined && { duree_pause: data.duree_pause }),
      ...(data.actif !== undefined && { actif: data.actif }),
    },
  });

  return {
    ...updated,
    heure_debut: datetimeToHeure(updated.heure_debut),
    heure_fin: datetimeToHeure(updated.heure_fin),
  };
};

// ─────────────────────────────────────────────
// DELETE — Désactive un modèle (soft) si des techniciens lui sont affectés
// ─────────────────────────────────────────────

export const deleteModelePlanification = async (id) => {
  const modele = await prisma.modele_planification.findUnique({
    where: { id_modele_planification: id },
    include: { _count: { select: { assigner: true } } },
  });

  if (!modele) {
    const error = new Error('Modèle de planification introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Suppression physique uniquement si aucun technicien affecté
  if (modele._count.assigner === 0) {
    await prisma.modele_zone.deleteMany({ where: { id_modele_planification: id } });
    return await prisma.modele_planification.delete({
      where: { id_modele_planification: id },
    });
  }

  // Sinon désactivation soft
  return await prisma.modele_planification.update({
    where: { id_modele_planification: id },
    data: { actif: false },
  });
};
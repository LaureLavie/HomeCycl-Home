// PLAN-09 : Service Affectation Modèle → Technicien
// US-29 : Affecter un modèle de planification à un technicien
// Compétence CDA : Développer des composants d'accès aux données SQL
import { prisma } from '../lib/prisma.js';
import { datetimeToHeure } from './modelePlanifService.js';

// ─────────────────────────────────────────────
// GET — Affectations d'un technicien (PLAN-10 : fiche technicien)
// ─────────────────────────────────────────────

export const getAffectationsTechnicien = async (id_technicien) => {
  const technicien = await prisma.technicien.findUnique({
    where: { id_technicien },
    select: {
      id_technicien: true,
      nom: true,
      prenom: true,
      telephone: true,
      authentification: { select: { email: true, actif: true } },
    },
  });

  if (!technicien) {
    const error = new Error('Technicien introuvable');
    error.statusCode = 404;
    throw error;
  }

  const affectations = await prisma.assigner.findMany({
    where: { id_technicien },
    include: {
      modele_planification: {
        include: {
          modeles_zone: {
            include: {
              zone: { select: { id_zone: true, nom: true } },
            },
          },
        },
      },
    },
  });

  // Formate les heures pour le front
  const affectationsFormattees = affectations.map((a) => ({
    ...a,
    modele_planification: {
      ...a.modele_planification,
      heure_debut: datetimeToHeure(a.modele_planification.heure_debut),
      heure_fin: datetimeToHeure(a.modele_planification.heure_fin),
    },
  }));

  return {
    technicien,
    affectations: affectationsFormattees,
    nbModeles: affectations.length,
  };
};

// ─────────────────────────────────────────────
// POST — Affecter un modèle à un technicien (Upsert)
// PLAN-10 : UI affectation modèle → technicien
// ─────────────────────────────────────────────

export const affecterModeleATechnicien = async (data) => {
  const { id_technicien, id_modele_planification } = data;

  // Vérifie que le technicien et le modèle existent
  const [technicien, modele] = await Promise.all([
    prisma.technicien.findUnique({
      where: { id_technicien },
      select: { id_technicien: true, nom: true, prenom: true },
    }),
    prisma.modele_planification.findUnique({
      where: { id_modele_planification },
      select: {
        id_modele_planification: true,
        nom: true,
        actif: true,
        heure_debut: true,
        heure_fin: true,
        duree_pause: true,
        modeles_zone: {
          include: {
            zone: { select: { id_zone: true, nom: true } },
          },
        },
      },
    }),
  ]);

  if (!technicien) {
    const error = new Error('Technicien introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (!modele) {
    const error = new Error('Modèle de planification introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (!modele.actif) {
    const error = new Error('Ce modèle de planification est désactivé');
    error.statusCode = 422;
    throw error;
  }

  // Vérifie que le modèle a au moins une zone configurée
  if (modele.modeles_zone.length === 0) {
    const error = new Error(
      'Ce modèle n\'a aucune zone géographique configurée. Ajoutez d\'abord une association modèle-zone.'
    );
    error.statusCode = 422;
    throw error;
  }

  // Upsert : évite les doublons sur la clé composite (id_technicien, id_modele_planification)
  const affectation = await prisma.assigner.upsert({
    where: {
      id_technicien_id_modele_planification: {
        id_technicien,
        id_modele_planification,
      },
    },
    update: {}, // Rien à mettre à jour — la relation existe déjà
    create: { id_technicien, id_modele_planification },
    include: {
      technicien: { select: { nom: true, prenom: true } },
      modele_planification: {
        select: {
          nom: true,
          heure_debut: true,
          heure_fin: true,
          duree_pause: true,
        },
      },
    },
  });

  return {
    ...affectation,
    modele_planification: {
      ...affectation.modele_planification,
      heure_debut: datetimeToHeure(affectation.modele_planification.heure_debut),
      heure_fin: datetimeToHeure(affectation.modele_planification.heure_fin),
    },
    message: `Modèle "${modele.nom}" affecté à ${technicien.nom} ${technicien.prenom}`,
  };
};

// ─────────────────────────────────────────────
// DELETE — Retirer un modèle d'un technicien
// ─────────────────────────────────────────────

export const retirerAffectation = async (id_technicien, id_modele_planification) => {
  // Vérifie que l'affectation existe
  const affectation = await prisma.assigner.findUnique({
    where: {
      id_technicien_id_modele_planification: { id_technicien, id_modele_planification },
    },
  });

  if (!affectation) {
    const error = new Error('Affectation introuvable');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.assigner.delete({
    where: {
      id_technicien_id_modele_planification: { id_technicien, id_modele_planification },
    },
  });
};

// ─────────────────────────────────────────────
// GET — Tous les techniciens avec leurs affectations (vue admin)
// ─────────────────────────────────────────────

export const getAllTechniciensAvecAffectations = async () => {
  const techniciens = await prisma.technicien.findMany({
    include: {
      authentification: { select: { email: true, actif: true } },
      assigner: {
        include: {
          modele_planification: {
            select: {
              id_modele_planification: true,
              nom: true,
              actif: true,
              heure_debut: true,
              heure_fin: true,
              modeles_zone: {
                include: { zone: { select: { id_zone: true, nom: true } } },
              },
            },
          },
        },
      },
      _count: { select: { interventions: true } },
    },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  });

  return techniciens.map((t) => ({
    ...t,
    assigner: t.assigner.map((a) => ({
      ...a,
      modele_planification: {
        ...a.modele_planification,
        heure_debut: datetimeToHeure(a.modele_planification.heure_debut),
        heure_fin: datetimeToHeure(a.modele_planification.heure_fin),
      },
    })),
  }));
};
// INTERV-16/17 : Affichage planning et liste techniciens
// Compétence CDA : Développer des composants d'accès aux données SQL
// Compétence CDA : Développer des composants métier (modèle de planification)
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// GET — Planning d'un technicien (vue calendrier)
// INTERV-16 : Affichage planning calendrier
// ─────────────────────────────────────────────

export const getPlanningTechnicien = async (id_technicien, { date_debut, date_fin }) => {
  // Fenêtre par défaut : semaine en cours si non précisée
  const debut = date_debut
    ? new Date(date_debut)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay() + 1); // lundi
        return d;
      })();

  const fin = date_fin
    ? new Date(date_fin)
    : (() => {
        const d = new Date(debut);
        d.setDate(d.getDate() + 6); // dimanche
        d.setHours(23, 59, 59, 999);
        return d;
      })();

  // Vérifie que le technicien existe
  const technicien = await prisma.technicien.findUnique({
    where: { id_technicien },
    select: { id_technicien: true, nom: true, prenom: true, telephone: true },
  });

  if (!technicien) {
    const error = new Error('Technicien introuvable');
    error.statusCode = 404;
    throw error;
  }

  const interventions = await prisma.intervention.findMany({
    where: {
      id_technicien,
      date_intervention: { gte: debut, lte: fin },
    },
    orderBy: { date_intervention: 'asc' },
    include: {
      client: { select: { nom: true, prenom: true, adresse: true, ville: true, telephone: true } },
      forfait: { select: { nom: true, duree_minutes: true, prix: true } },
      zone: { select: { nom: true } },
      velo: { select: { marque: true, modele: true, type_velo: true } },
      inclure: {
        include: { produit: { select: { nom: true, prix: true } } },
      },
    },
  });

  // Groupe les interventions par jour (format calendrier)
  const parJour = interventions.reduce((acc, interv) => {
    const jour = new Date(interv.date_intervention).toISOString().split('T')[0];
    if (!acc[jour]) acc[jour] = [];
    acc[jour].push(interv);
    return acc;
  }, {});

  return {
    technicien,
    periode: {
      debut: debut.toISOString(),
      fin: fin.toISOString(),
    },
    total: interventions.length,
    parJour,
    interventions,
  };
};

// ─────────────────────────────────────────────
// GET — Planning global tous techniciens (vue admin)
// INTERV-16 : Vue d'ensemble admin
// ─────────────────────────────────────────────

export const getPlanningGlobal = async ({ date_debut, date_fin }) => {
  const debut = date_debut ? new Date(date_debut) : (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1);
    return d;
  })();

  const fin = date_fin ? new Date(date_fin) : (() => {
    const d = new Date(debut);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  })();

  // Tous les techniciens avec leurs interventions sur la période
  const techniciens = await prisma.technicien.findMany({
    select: {
      id_technicien: true,
      nom: true,
      prenom: true,
      interventions: {
        where: {
          date_intervention: { gte: debut, lte: fin },
        },
        orderBy: { date_intervention: 'asc' },
        include: {
          client: { select: { nom: true, prenom: true } },
          forfait: { select: { nom: true, duree_minutes: true } },
          zone: { select: { nom: true } },
        },
      },
    },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  });

  return {
    periode: { debut: debut.toISOString(), fin: fin.toISOString() },
    techniciens: techniciens.map((t) => ({
      ...t,
      nbInterventions: t.interventions.length,
    })),
  };
};

// ─────────────────────────────────────────────
// GET — Liste des techniciens (INTERV-17)
// Avec leurs stats et zone(s) assignée(s)
// ─────────────────────────────────────────────

export const getListeTechniciens = async () => {
  const techniciens = await prisma.technicien.findMany({
    include: {
      authentification: { select: { email: true, actif: true } },
      // Modèles de planification assignés
      assigner: {
        include: {
          modele_planification: {
            include: {
              modeles_zone: {
                include: { zone: { select: { id_zone: true, nom: true } } },
              },
            },
          },
        },
      },
      _count: {
        select: {
          interventions: true,
        },
      },
    },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  });

  // Reshape : extrait les zones directement
  return techniciens.map((t) => {
    const zones = t.assigner.flatMap((a) =>
      a.modele_planification.modeles_zone.map((mz) => mz.zone)
    );
    const uniqueZones = zones.filter(
      (z, i, arr) => arr.findIndex((x) => x.id_zone === z.id_zone) === i
    );

    return {
      id_technicien: t.id_technicien,
      nom: t.nom,
      prenom: t.prenom,
      telephone: t.telephone,
      email: t.authentification?.email,
      actif: t.authentification?.actif,
      zones: uniqueZones,
      nbInterventions: t._count.interventions,
    };
  });
};

// ─────────────────────────────────────────────
// GET/POST/DELETE — Modèles de planification
// ─────────────────────────────────────────────

export const getAllModelePlanification = async () => {
  return await prisma.modele_planification.findMany({
    where: { actif: true },
    include: {
      modeles_zone: {
        include: { zone: { select: { nom: true } } },
      },
      assigner: {
        include: {
          technicien: { select: { nom: true, prenom: true } },
        },
      },
    },
    orderBy: { nom: 'asc' },
  });
};

export const assignerTechnicienModele = async (id_technicien, id_modele_planification) => {
  // Vérifie l'existence du technicien et du modèle
  const [technicien, modele] = await Promise.all([
    prisma.technicien.findUnique({ where: { id_technicien } }),
    prisma.modele_planification.findUnique({ where: { id_modele_planification } }),
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

  // Upsert : évite les doublons (id composite)
  return await prisma.assigner.upsert({
    where: { id_technicien_id_modele_planification: { id_technicien, id_modele_planification } },
    update: {},
    create: { id_technicien, id_modele_planification },
  });
};
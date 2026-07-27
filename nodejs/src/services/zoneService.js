// MAP-02 : Stockage et gestion des zones géographiques
// Compétence CDA : Développer des composants d'accès aux données SQL
// Architecture : Le GeoJSON des polygones dessinés par l'admin via Leaflet/Geoman IO
//                est stocké en TEXT dans la colonne `geojson` (PostgreSQL natif JSON)
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// GET ALL — Liste toutes les zones avec techniciens assignés
// MAP-02 : Affichage zones + attribution techniciens
// ─────────────────────────────────────────────

export const getAllZones = async () => {
  const zones = await prisma.zone.findMany({
    orderBy: { nom: 'asc' },
    include: {
      // Techniciens qui ont un modèle de planification dans cette zone
      modeles_zone: {
        include: {
          modele_planification: {
            include: {
              assigner: {
                include: {
                  technicien: {
                    select: { id_technicien: true, nom: true, prenom: true },
                  },
                },
              },
            },
          },
        },
      },
      _count: { select: { interventions: true } },
    },
  });

  // Reshape : extrait les techniciens directement dans la zone
  return zones.map((zone) => {
    const techniciens = zone.modeles_zone.flatMap((mz) =>
      mz.modele_planification.assigner.map((a) => a.technicien)
    );
    // Déduplique par id
    const uniqueTechniciens = techniciens.filter(
      (t, i, arr) => arr.findIndex((x) => x.id_technicien === t.id_technicien) === i
    );

    return {
      ...zone,
      techniciens: uniqueTechniciens,
    };
  });
};

// ─────────────────────────────────────────────
// GET ONE — Détail d'une zone avec son GeoJSON
// ─────────────────────────────────────────────

export const getZoneById = async (id) => {
  const zone = await prisma.zone.findUnique({
    where: { id_zone: id },
    include: {
      modeles_zone: {
        include: {
          modele_planification: {
            include: {
              assigner: {
                include: {
                  technicien: { select: { id_technicien: true, nom: true, prenom: true } },
                },
              },
            },
          },
        },
      },
      interventions: {
        select: { id_intervention: true, date_intervention: true, statut: true },
        orderBy: { date_intervention: 'desc' },
        take: 5,
      },
    },
  });

  if (!zone) {
    const error = new Error('Zone introuvable');
    error.statusCode = 404;
    throw error;
  }

  return zone;
};

// ─────────────────────────────────────────────
// POST — Création d'une zone
// Le GeoJSON est fourni par Leaflet/Geoman IO côté front
// ─────────────────────────────────────────────

export const createZone = async (data) => {
  const existing = await prisma.zone.findFirst({
    where: { nom: { equals: data.nom, mode: 'insensitive' } },
  });

  if (existing) {
    const error = new Error(`Une zone nommée "${data.nom}" existe déjà`);
    error.statusCode = 409;
    throw error;
  }

  return await prisma.zone.create({
    data: {
      nom: data.nom,
      description: data.description,
      // Le GeoJSON est stocké en TEXT brut (stringify côté front avant envoi)
      geojson: data.geojson,
      frais_deplacement: data.frais_deplacement,
    },
  });
};

// ─────────────────────────────────────────────
// PUT — Mise à jour d'une zone (MAP-04 : bouton sauvegarde)
// Permet de redessiner la zone ou changer le nom/frais
// ─────────────────────────────────────────────

export const updateZone = async (id, data) => {
  const zone = await prisma.zone.findUnique({ where: { id_zone: id } });

  if (!zone) {
    const error = new Error('Zone introuvable');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.zone.update({
    where: { id_zone: id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.geojson !== undefined && { geojson: data.geojson }),
      ...(data.frais_deplacement !== undefined && {
        frais_deplacement: data.frais_deplacement,
      }),
    },
  });
};

// ─────────────────────────────────────────────
// DELETE — Suppression zone (seulement si aucune intervention)
// ─────────────────────────────────────────────

export const deleteZone = async (id) => {
  const zone = await prisma.zone.findUnique({
    where: { id_zone: id },
    include: { _count: { select: { interventions: true } } },
  });

  if (!zone) {
    const error = new Error('Zone introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (zone._count.interventions > 0) {
    const error = new Error(
      `Impossible de supprimer : ${zone._count.interventions} intervention(s) sont rattachées à cette zone`
    );
    error.statusCode = 422;
    throw error;
  }

  // Supprime les modèles_zone d'abord (FK)
  await prisma.modele_zone.deleteMany({ where: { id_zone: id } });
  return await prisma.zone.delete({ where: { id_zone: id } });
};

// ─────────────────────────────────────────────
// GET — Toutes les zones avec GeoJSON (pour Leaflet)
// Endpoint dédié carte : retourne uniquement id/nom/geojson/couleur
// MAP-03 : stockage URL des interventions par zone
// ─────────────────────────────────────────────

export const getZonesGeoJson = async () => {
  const zones = await prisma.zone.findMany({
    select: {
      id_zone: true,
      nom: true,
      geojson: true,
      frais_deplacement: true,
    },
    orderBy: { nom: 'asc' },
  });

  // Retourne le GeoJSON parsé pour faciliter l'affichage Leaflet
  return zones.map((z) => ({
    ...z,
    geojson: z.geojson ? JSON.parse(z.geojson) : null,
  }));
};
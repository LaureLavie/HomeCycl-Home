// back/src/services/dashboardService.js
// DASH-01 : Agrégation des indicateurs du tableau de bord admin
// Compétence CDA : Développer des composants d'accès aux données SQL
import { prisma } from '../lib/prisma.js';

const OBJECTIF_CA_MENSUEL = 15000; // TODO évolution : rendre configurable via Entreprise

export const getDashboardStats = async () => {
  const maintenant = new Date();
  const debutJour = new Date(maintenant); debutJour.setHours(0, 0, 0, 0);
  const finJour = new Date(maintenant); finJour.setHours(23, 59, 59, 999);
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    interventionsJour,
    techniciensActifsListe,
    interventionsMoisTerminees,
    demandesEnAttenteListe,
    activitesRecentesBrutes,
  ] = await Promise.all([
    prisma.intervention.findMany({
      where: { date_intervention: { gte: debutJour, lte: finJour } },
      select: { statut: true },
    }),
    prisma.technicien.findMany({
      where: { authentification: { actif: true } },
      select: { id_technicien: true, nom: true, prenom: true },
      orderBy: { nom: 'asc' },
    }),
    prisma.intervention.findMany({
      where: { date_intervention: { gte: debutMois, lte: finMois }, statut: 'TERMINEE' },
      select: { montant: true },
    }),
    prisma.intervention.findMany({
      where: { statut: 'PLANIFIEE', id_technicien: null },
      select: { date_creation: true },
    }),
    prisma.intervention.findMany({
      take: 5,
      orderBy: { date_creation: 'desc' },
      include: {
        client: { select: { nom: true, prenom: true, ville: true } },
        forfait: { select: { nom: true } },
      },
    }),
  ]);

  // ── Interventions du jour ─────────────────────────────
  const totalJour = interventionsJour.length;
  const termineesJour = interventionsJour.filter((i) => i.statut === 'TERMINEE').length;

  // ── Chiffre d'affaires du mois (interventions terminées uniquement) ──
  const chiffreAffairesMois = interventionsMoisTerminees.reduce(
    (sum, i) => sum + Number(i.montant || 0),
    0
  );

  // ── Demandes en attente (réservations sans technicien assigné) ──
  const totalAttente = demandesEnAttenteListe.length;
  const tempsMoyenHeures = totalAttente > 0
    ? demandesEnAttenteListe.reduce((sum, i) => {
        return sum + (maintenant.getTime() - new Date(i.date_creation).getTime()) / 3_600_000;
      }, 0) / totalAttente
    : 0;

  // ── Activités récentes — mapping statut → libellé/badge ──
  const activitesRecentes = activitesRecentesBrutes.map((i) => {
    let action = 'a réservé';
    let badge = { label: 'CONFIRMÉ', code: 'confirme' };

    if (i.statut === 'TERMINEE') {
      action = 'a terminé la réparation de';
      badge = { label: 'TERMINÉ', code: 'termine' };
    } else if (i.statut === 'ABSENT_CLIENT' || i.statut === 'EN_COURS') {
      action = 'a signalé un problème sur';
      badge = { label: 'À TRAITER', code: 'a-traiter' };
    } else if (i.statut === 'ANNULEE') {
      action = 'a annulé';
      badge = { label: 'ANNULÉ', code: 'annule' };
    }

    return {
      id_intervention: i.id_intervention,
      client: i.client ? `${i.client.prenom} ${i.client.nom}` : 'Client anonyme',
      ville: i.client?.ville || null,
      action,
      libelle: i.forfait?.nom || 'Intervention',
      badge: badge.label,
      badgeCode: badge.code,
      date_creation: i.date_creation,
    };
  });

  return {
    date: maintenant.toISOString(),
    interventionsDuJour: { total: totalJour, terminees: termineesJour },
    techniciensActifs: {
      total: techniciensActifsListe.length,
      apercu: techniciensActifsListe.slice(0, 3),
    },
    chiffreAffairesMois: { total: chiffreAffairesMois, objectif: OBJECTIF_CA_MENSUEL },
    demandesEnAttente: {
      total: totalAttente,
      tempsMoyenHeures: Math.round(tempsMoyenHeures * 10) / 10,
    },
    activitesRecentes,
    // ⚠️ MOCK — aucun modèle "stock" en base (Produit n'a pas de champ
    // quantité dans le MVP). Placeholder à documenter comme évolution
    // future dans le dossier CDA (partie anomalies/limites connues).
    stockPieces: [
      { nom: 'Plaquettes de frein', pourcentage: 85 },
      { nom: 'Pneus 700c e-bike', pourcentage: 12 },
    ],
  };
};
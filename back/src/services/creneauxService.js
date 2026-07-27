// PLAN-13 : Moteur de génération des créneaux disponibles
// US-31 : Générer et afficher les créneaux disponibles
// Compétence CDA : Développer des composants métier — Algorithme de planification
//
// ═══════════════════════════════════════════════════════════════
// ALGORITHME :
//   1. Récupère le forfait → durée en minutes (US-30)
//   2. Récupère la zone → modèles de planification associés
//   3. Pour chaque modèle actif → pour chaque technicien affecté :
//      a. Récupère les interventions déjà planifiées sur la période
//      b. Génère les créneaux horaires de la journée (heure_debut → heure_fin)
//         en découpant par : duree_forfait + buffer_deplacement
//      c. Exclut les créneaux qui chevauchent la pause déjeuner
//      d. Exclut les créneaux déjà occupés par une intervention
//      e. Exclut les créneaux qui dépassent heure_fin
//   4. Retourne la liste ordonnée des créneaux libres
// ═══════════════════════════════════════════════════════════════
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// Utilitaire : ajoute N minutes à une heure HH:MM
// ─────────────────────────────────────────────

const addMinutes = (heureMinutes, minutes) => {
  return heureMinutes + minutes;
};

// ─────────────────────────────────────────────
// Utilitaire : convertit une date DateTime en minutes depuis minuit
// ─────────────────────────────────────────────

const dateToMinutes = (dt) => {
  const d = new Date(dt);
  return d.getHours() * 60 + d.getMinutes();
};

// ─────────────────────────────────────────────
// Utilitaire : construit un DateTime pour un jour J à HH:MM
// ─────────────────────────────────────────────

const buildDatetime = (dateStr, minutesDepuisMinuit) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const h = Math.floor(minutesDepuisMinuit / 60);
  const m = minutesDepuisMinuit % 60;
  return new Date(year, month - 1, day, h, m, 0, 0);
};

// ─────────────────────────────────────────────
// Vérifie si un créneau chevauche un intervalle existant
// Un créneau [debutCreneau, finCreneau] chevauche [debutOccupe, finOccupe]
// si debutCreneau < finOccupe ET finCreneau > debutOccupe
// ─────────────────────────────────────────────

const chevauche = (debutCreneau, finCreneau, debutOccupe, finOccupe) => {
  return debutCreneau < finOccupe && finCreneau > debutOccupe;
};

// ═════════════════════════════════════════════
// MOTEUR PRINCIPAL : génère les créneaux disponibles
// ═════════════════════════════════════════════

export const genererCreneauxDisponibles = async ({ id_forfait, id_zone, date_debut, date_fin }) => {
  // ─── 1. Récupère le forfait et sa durée (US-30) ───────────────

  const forfait = await prisma.forfait.findUnique({
    where: { id_forfait },
    select: { id_forfait: true, nom: true, duree_minutes: true, actif: true, prix: true },
  });

  if (!forfait) {
    const error = new Error('Forfait introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (!forfait.actif) {
    const error = new Error('Ce forfait n\'est plus disponible');
    error.statusCode = 410;
    throw error;
  }

  if (!forfait.duree_minutes || forfait.duree_minutes <= 0) {
    const error = new Error(
      'Ce forfait n\'a pas de durée configurée. Contactez l\'administrateur.'
    );
    error.statusCode = 422;
    throw error;
  }

  const dureeForfait = forfait.duree_minutes;

  // ─── 2. Récupère la zone et ses modèles de planification ─────

  const zone = await prisma.zone.findUnique({
    where: { id_zone },
    select: { id_zone: true, nom: true },
  });

  if (!zone) {
    const error = new Error('Zone géographique introuvable');
    error.statusCode = 404;
    throw error;
  }

  // Modèles_zone : config de cette zone (buffer, max interventions)
  const configsZone = await prisma.modele_zone.findMany({
    where: { id_zone },
    include: {
      modele_planification: {
        include: {
          // Techniciens affectés à ce modèle
          assigner: {
            include: {
              technicien: {
                select: { id_technicien: true, nom: true, prenom: true },
                // Filtre : uniquement les techniciens actifs
                where: {
                  authentification: { actif: true },
                },
              },
            },
          },
        },
      },
    },
  });

  if (configsZone.length === 0) {
    return {
      forfait: { nom: forfait.nom, duree_minutes: dureeForfait, prix: forfait.prix },
      zone: zone.nom,
      creneaux: [],
      message: 'Aucun technicien n\'est actuellement configuré pour intervenir dans cette zone.',
    };
  }

  // ─── 3. Construit la liste des jours de la période ────────────

  const debut = new Date(date_debut);
  const fin = date_fin
    ? new Date(date_fin)
    : (() => {
        const d = new Date(debut);
        d.setDate(d.getDate() + 6); // 7 jours par défaut
        return d;
      })();

  // Liste des jours ouvrables (lundi à samedi, pas dimanche)
  const jours = [];
  const current = new Date(debut);
  while (current <= fin) {
    const jourSemaine = current.getDay(); // 0=dim, 1=lun...6=sam
    if (jourSemaine !== 0) { // Exclut le dimanche
      jours.push(current.toISOString().split('T')[0]); // "YYYY-MM-DD"
    }
    current.setDate(current.getDate() + 1);
  }

  // ─── 4. Pour chaque config zone → technicien → jour : génère les créneaux ─

  const tousLesCreneaux = [];

  for (const config of configsZone) {
    const modele = config.modele_planification;

    // Ignore les modèles désactivés
    if (!modele.actif) continue;

    // Heures du modèle en minutes depuis minuit (ex: 08:00 → 480)
    const minuteDebut = dateToMinutes(modele.heure_debut);
    const minuteFin = dateToMinutes(modele.heure_fin);
    const dureePause = modele.duree_pause; // en minutes

    // Buffer déplacement pour cette zone
    const buffer = config.buffer_deplacement;
    const maxParJour = config.max_intervention_jour;

    // Durée d'un "slot" = durée forfait + déplacement
    const dureeSlot = dureeForfait + buffer;

    // Calcule l'heure de début de la pause déjeuner
    // Hypothèse MVP : pause au milieu de la journée (à affiner avec un champ dédié)
    const dureeJournee = minuteFin - minuteDebut;
    const debutPause = minuteDebut + Math.floor((dureeJournee - dureePause) / 2);
    const finPause = debutPause + dureePause;

    for (const techAssign of modele.assigner) {
      const technicien = techAssign.technicien;
      if (!technicien) continue;

      for (const jour of jours) {
        // Récupère les interventions déjà planifiées ce jour pour ce technicien
        const debutJour = new Date(`${jour}T00:00:00.000Z`);
        const finJour = new Date(`${jour}T23:59:59.999Z`);

        const interventionsExistantes = await prisma.intervention.findMany({
          where: {
            id_technicien: technicien.id_technicien,
            date_intervention: { gte: debutJour, lte: finJour },
            statut: { notIn: ['ANNULEE'] }, // Les annulées libèrent le créneau
          },
          select: {
            heure_debut: true,
            heure_fin: true,
            forfait: { select: { duree_minutes: true } },
          },
        });

        // Vérifie le max d'interventions par jour
        if (interventionsExistantes.length >= maxParJour) {
          continue; // Journée complète pour ce technicien
        }

        // Convertit les interventions existantes en plages occupées [debut, fin] en minutes
        const plagesOccupees = interventionsExistantes.map((i) => {
          const debutInterv = i.heure_debut
            ? dateToMinutes(i.heure_debut)
            : null;
          const duree = i.forfait?.duree_minutes || dureeForfait;
          const finInterv = debutInterv !== null
            ? debutInterv + duree + buffer
            : null;
          return debutInterv !== null ? [debutInterv, finInterv] : null;
        }).filter(Boolean);

        // ── Génère les créneaux pour ce jour ──────────────────

        let curseur = minuteDebut;

        while (curseur + dureeForfait <= minuteFin) {
          const debutCreneau = curseur;
          const finCreneau = curseur + dureeForfait;
          const finAvecBuffer = curseur + dureeSlot;

          // EXCLUSION 1 : dépasse l'heure de fin de journée
          if (finCreneau > minuteFin) break;

          // EXCLUSION 2 : chevauche la pause déjeuner
          const chevauchePause = chevauche(debutCreneau, finCreneau, debutPause, finPause);
          if (chevauchePause) {
            // Saute à la fin de la pause
            curseur = finPause;
            continue;
          }

          // EXCLUSION 3 : chevauche une intervention existante
          const estOccupe = plagesOccupees.some(([d, f]) =>
            chevauche(debutCreneau, finAvecBuffer, d, f)
          );

          if (!estOccupe) {
            // ✅ Créneau disponible !
            tousLesCreneaux.push({
              date: jour,
              heure_debut: `${String(Math.floor(debutCreneau / 60)).padStart(2, '0')}:${String(debutCreneau % 60).padStart(2, '0')}`,
              heure_fin: `${String(Math.floor(finCreneau / 60)).padStart(2, '0')}:${String(finCreneau % 60).padStart(2, '0')}`,
              // DateTime ISO pour la création de l'intervention
              datetime_debut: buildDatetime(jour, debutCreneau).toISOString(),
              datetime_fin: buildDatetime(jour, finCreneau).toISOString(),
              technicien: {
                id_technicien: technicien.id_technicien,
                nom: technicien.nom,
                prenom: technicien.prenom,
              },
              zone: zone.nom,
              duree_minutes: dureeForfait,
              modele: modele.nom,
            });
          }

          // Avance d'un slot
          curseur += dureeSlot;
        }
      }
    }
  }

  // ─── 5. Tri et déduplique les créneaux ────────────────────────

  // Trie par date + heure_debut
  tousLesCreneaux.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.heure_debut.localeCompare(b.heure_debut);
  });

  // Groupe par jour pour faciliter l'affichage calendrier côté front
  const parJour = tousLesCreneaux.reduce((acc, c) => {
    if (!acc[c.date]) acc[c.date] = [];
    acc[c.date].push(c);
    return acc;
  }, {});

  return {
    forfait: {
      id_forfait,
      nom: forfait.nom,
      duree_minutes: dureeForfait,
      prix: forfait.prix,
    },
    zone: { id_zone, nom: zone.nom },
    periode: {
      debut: date_debut,
      fin: fin.toISOString().split('T')[0],
    },
    total: tousLesCreneaux.length,
    parJour,
    creneaux: tousLesCreneaux,
  };
};

// ─────────────────────────────────────────────
// US-30 : Vérifier/mettre à jour la durée d'un forfait
// PLAN-12 : Champ durée dans le formulaire forfait
// ─────────────────────────────────────────────

export const updateForfaitDuree = async (id_forfait, duree_minutes) => {
  const forfait = await prisma.forfait.findUnique({
    where: { id_forfait },
    select: { id_forfait: true, nom: true, duree_minutes: true },
  });

  if (!forfait) {
    const error = new Error('Forfait introuvable');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.forfait.update({
    where: { id_forfait },
    data: { duree_minutes },
    select: {
      id_forfait: true,
      nom: true,
      prix: true,
      duree_minutes: true,
      actif: true,
    },
  });
};

// ─────────────────────────────────────────────
// GET ALL — Forfaits sans durée configurée (alerte admin)
// ─────────────────────────────────────────────

export const getForfaitsSansDuree = async () => {
  return await prisma.forfait.findMany({
    where: {
      actif: true,
      OR: [
        { duree_minutes: null },
        { duree_minutes: { lte: 0 } },
      ],
    },
    select: { id_forfait: true, nom: true, prix: true },
  });
};
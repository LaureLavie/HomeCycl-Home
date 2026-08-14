// PLAN-14 : Synchronisation calendrier Cronofy
// US-31 : Créneaux disponibles synchronisés
// Compétence CDA : Intégration d'API tierces
import Cronofy from 'cronofy';

// ─── Client Cronofy (OAuth2 Client Credentials) ───────────────
const cronofy = new Cronofy({
  client_id:     process.env.CRONOFY_CLIENT_ID,
  client_secret: process.env.CRONOFY_CLIENT_SECRET,
  access_token:  process.env.CRONOFY_ACCESS_TOKEN,  // token du compte entreprise
});

// ─────────────────────────────────────────────
// Crée un événement dans le calendrier du technicien
// Appelé après createReservation()
// ─────────────────────────────────────────────
export const creerEvenementIntervention = async ({
  id_intervention,
  technicien,
  client,
  forfait,
  adresse,
  datetime_debut,
  datetime_fin,
}) => {
  try {
    await cronofy.upsertEvent({
      calendar_id: process.env.CRONOFY_CALENDAR_ID,
      event_id:    `hch-interv-${id_intervention}`,
      summary:     `🔧 ${forfait.nom} — ${client.prenom} ${client.nom}`,
      description: [
        `Forfait : ${forfait.nom} (${forfait.duree_minutes} min)`,
        `Client  : ${client.prenom} ${client.nom}`,
        `Adresse : ${adresse}`,
        `Technicien : ${technicien.prenom} ${technicien.nom}`,
      ].join('\n'),
      start:    datetime_debut,   // ISO 8601 ex: "2026-08-20T09:00:00Z"
      end:      datetime_fin,
      location: { description: adresse },
      reminders: [{ minutes: 60 }],
    });

    return { success: true };
  } catch (err) {
    // On ne bloque pas la réservation si Cronofy échoue
    console.error('[Cronofy] Erreur création événement :', err.message);
    return { success: false, error: err.message };
  }
};

// ─────────────────────────────────────────────
// Supprime l'événement Cronofy lors d'une annulation
// ─────────────────────────────────────────────
export const supprimerEvenementIntervention = async (id_intervention) => {
  try {
    await cronofy.deleteEvent({
      calendar_id: process.env.CRONOFY_CALENDAR_ID,
      event_id:    `hch-interv-${id_intervention}`,
    });
    return { success: true };
  } catch (err) {
    console.error('[Cronofy] Erreur suppression événement :', err.message);
    return { success: false, error: err.message };
  }
};

// ─────────────────────────────────────────────
// Vérifie les disponibilités d'un technicien sur Cronofy
// Retourne les plages occupées sur la période
// ─────────────────────────────────────────────
export const getDisponibilitesExternesTechnicien = async (date_debut, date_fin) => {
  try {
    const result = await cronofy.freeBusy({
      participants: [{
        members: [{ calendar_ids: [process.env.CRONOFY_CALENDAR_ID] }],
        required: 'all',
      }],
      required_duration: { minutes: 60 },
      available_periods: [{
        start: `${date_debut}T00:00:00Z`,
        end:   `${date_fin}T23:59:59Z`,
      }],
    });
    return result;
  } catch (err) {
    console.error('[Cronofy] Erreur free/busy :', err.message);
    return null;
  }
};
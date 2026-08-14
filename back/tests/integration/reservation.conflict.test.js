// back/tests/integration/reservation.conflict.test.js
import '../setup/env.cjs';
// ... setup similaire (client + forfait + technicien + zone existants)

describe('E4-TI02 — Conflit de créneau', () => {
  it('BUG-002 : refuse un second créneau identique (comportement attendu, actuellement KO)', async () => {
    // 1ère réservation sur le créneau
    await request(app).post('/api/reservations').send(reservationPayload);

    // 2ème réservation sur le MÊME technicien/créneau
    const res = await request(app).post('/api/reservations').send(reservationPayload);

    // ⚠️ Constat : reservationService.createReservation() ne vérifie aucun chevauchement
    // avant l'insertion → aujourd'hui ce test échoue (status 201 au lieu de 409 attendu)
    expect(res.status).toBe(409);
  });
});
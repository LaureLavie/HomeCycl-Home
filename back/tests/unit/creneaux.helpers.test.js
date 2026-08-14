// back/tests/unit/creneaux.helpers.test.js
import { dateToMinutes, chevauche, buildDatetime } from '../../src/services/creneauxService.js';

describe('E3-TU02 (adapté) — chevauche()', () => {
  it('détecte un chevauchement entre deux créneaux', () => {
    // 09:00-10:00 (540-600) vs 09:30-10:30 (570-630) => chevauchement
    expect(chevauche(540, 600, 570, 630)).toBe(true);
  });

  it('ne détecte pas de chevauchement si les créneaux sont adjacents', () => {
    // 09:00-10:00 (540-600) vs 10:00-11:00 (600-660) => pas de chevauchement
    expect(chevauche(540, 600, 600, 660)).toBe(false);
  });
});

describe('E3-TU03 — Exclusion pause déjeuner', () => {
  it('un créneau qui recouvre la pause 12:00-13:00 est exclu', () => {
    const debutCreneau = 11 * 60 + 30; // 11h30
    const finCreneau = 12 * 60 + 30;   // 12h30
    const debutPause = 12 * 60;        // 12h00
    const finPause = 13 * 60;          // 13h00
    expect(chevauche(debutCreneau, finCreneau, debutPause, finPause)).toBe(true);
  });
});

describe('dateToMinutes()', () => {
  it('convertit une heure DateTime en minutes depuis minuit', () => {
    const dt = new Date(2026, 0, 1, 9, 30); // 09:30
    expect(dateToMinutes(dt)).toBe(570);
  });
});
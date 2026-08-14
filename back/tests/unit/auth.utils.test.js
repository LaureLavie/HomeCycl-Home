// back/tests/unit/auth.utils.test.js
import 'dotenv/config';
dotenv.config({ path: new URL('../../.env.test', import.meta.url).pathname });

import jwt from 'jsonwebtoken';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from '../../src/utils/auth.js';

describe('E2-TU01 — Hachage bcrypt', () => {
  it('retourne un hash bcrypt de 60 caractères, jamais le mot de passe en clair', async () => {
    const hash = await hashPassword('MonMotDePasse1');
    expect(hash).toHaveLength(60);
    expect(hash.startsWith('$2b$')).toBe(true);
    expect(hash).not.toBe('MonMotDePasse1');
  });
});

describe('E2-TU02 — Comparaison bcrypt', () => {
  it('retourne false pour un mauvais mot de passe et true pour le bon', async () => {
    const hash = await hashPassword('BonMotDePasse1');
    await expect(comparePassword('MauvaisMotDePasse', hash)).resolves.toBe(false);
    await expect(comparePassword('BonMotDePasse1', hash)).resolves.toBe(true);
  });
});

describe('E2-TU03 — Génération JWT', () => {
  it('retourne un token décodable contenant id, role et une expiration', () => {
    const token = generateToken({ id_authentification: 'uuid-123', Role: 'CLIENT' });
    const decoded = jwt.decode(token);
    expect(decoded.id).toBe('uuid-123');
    expect(decoded.role).toBe('CLIENT');
    expect(decoded.exp).toBeDefined();
  });
});

describe('E2-TU04 — Vérification JWT (token valide)', () => {
  it('retourne le payload décodé sans erreur', () => {
    const token = generateToken({ id_authentification: 'uuid-123', Role: 'ADMIN' });
    const payload = verifyToken(token);
    expect(payload.role).toBe('ADMIN');
  });
});

describe('E2-TU05 — Vérification JWT (token expiré)', () => {
  it('ne retourne aucun payload exploitable', () => {
    const expiredToken = jwt.sign(
      { id: 'uuid-123', role: 'CLIENT' },
      process.env.JWT_SECRET,
      { expiresIn: '-10s' } // déjà expiré à la génération
    );
    // ⚠️ Écart constaté : verifyToken() ne "lève" pas d'erreur, elle catch et retourne null
    // (cahier à corriger en conséquence : "retourne null" et non "lève une erreur")
    expect(verifyToken(expiredToken)).toBeNull();
  });
});

describe('E2-TU06 — Vérification JWT (token falsifié)', () => {
  it('rejette un token signé avec une clé différente', () => {
    const fauxToken = jwt.sign({ id: 'uuid-123', role: 'ADMIN' }, 'mauvaise_cle_secrete');
    expect(verifyToken(fauxToken)).toBeNull();
  });
});
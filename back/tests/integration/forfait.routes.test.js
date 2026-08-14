// back/tests/integration/forfait.routes.test.js
import '../env.cjs';
import express from 'express';
import request from 'supertest';
import { forfaitRouter } from '../../src/routes/interventionRoute.js';
import authRouter from '../../src/routes/authRoute.js';
import { prisma } from '../../src/lib/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/forfait', forfaitRouter);

let tokenAdmin;
let idForfaitCree;
const emailAdmin = `jest-admin-${Date.now()}@homecyclhome.fr`;

beforeAll(async () => {
  // Nettoyer la table avant le test
  await prisma.authentification.deleteMany({});

  // Créer l'admin manuellement via Prisma
  await prisma.authentification.create({
    data: {
      email: 'admin@test.com',
      mot_passe_hash: await bcrypt.hash('AdminTest1', 10),
      Role: 'ADMIN',
      administrateur: { create: { nom: 'Admin Test' } }
    }
  });


  const login = await request(app)
  .post('/api/auth/login')
  .send({ email: emailAdmin, mot_passe: 'AdminTest1' });

// Diagnostic : afficher la réponse si le login échoue
if (login.status !== 200) {
  console.error('Login admin échoué :', login.status, login.body);
}
expect(login.status).toBe(200);
tokenAdmin = login.body.data.token;
  // Jeu d'essai : un compte admin pour le test
  await request(app).post('/api/auth/inscription').send({
    email: emailAdmin,
    mot_passe: 'AdminTest1',
    role: 'ADMIN',
    nom: 'AdminJest',
  });
});

afterAll(async () => {
  if (idForfaitCree) await prisma.forfait.deleteMany({ where: { id_forfait: idForfaitCree } });
  await prisma.authentification.deleteMany({ where: { email: emailAdmin } });
  await prisma.$disconnect();
});

describe('E3-TI07 — CRUD Forfaits (Admin)', () => {
  it('crée un forfait (201)', async () => {
    const res = await request(app)
      .post('/api/forfait')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nom: `Forfait Jest ${Date.now()}`, prix: 45, duree_minutes: 60 });
    expect(res.status).toBe(201);
    idForfaitCree = res.body.data.id_forfait;
  });

  it('un forfait désactivé (actif=false) est filtré côté public', async () => {
    await request(app)
      .put(`/api/forfait/${idForfaitCree}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ actif: false });

    const res = await request(app).get('/api/forfait?actif=true');
    const noms = res.body.data.map((f) => f.id_forfait);
    expect(noms).not.toContain(idForfaitCree);
  });
});
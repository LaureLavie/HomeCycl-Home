// back/tests/integration/auth.routes.test.js
import '../setup/env.cjs'; // charge .env.test avant tout import
import express from 'express';
import request from 'supertest';
import authRouter from '../../src/routes/authRoute.js';
import { userRouter } from '../../src/routes/userRoute.js';
import { prisma } from '../../src/lib/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

const emailTest = `jest-${Date.now()}@homecyclhome.fr`;

afterAll(async () => {
  // Nettoyage du jeu d'essai créé pendant la session
  await prisma.client.deleteMany({ where: { authentification: { email: emailTest } } });
  await prisma.authentification.deleteMany({ where: { email: emailTest } });
  await prisma.$disconnect();
});

describe('E2-TI07 — POST /api/auth/inscription', () => {
  it('crée un compte CLIENT et retourne 201', async () => {
    const res = await request(app).post('/api/auth/inscription').send({
      email: emailTest,
      mot_passe: 'MotDePasse1',
      role: 'CLIENT',
      nom: 'Lavie',
      prenom: 'Laure',
      adresse: '1 rue de Lyon',
      code_postal: '69001',
      ville: 'Lyon',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });
});

describe('E2-TI09/10 — POST /api/auth/login', () => {
  it('connexion réussie retourne un token (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: emailTest, mot_passe: 'MotDePasse1' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('mauvais mot de passe → 401, message générique', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: emailTest, mot_passe: 'faux' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/incorrect/i);
  });
});

describe('E2-TI11/12 — Route protégée /api/user', () => {
  it('sans token → 401', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(401);
  });

  it('avec un token rôle CLIENT → 403 (route réservée ADMIN)', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: emailTest, mot_passe: 'MotDePasse1' });
    const token = login.body.data.token;

    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
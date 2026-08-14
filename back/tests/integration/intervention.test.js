import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

describe('Tests des Interventions', () => {
  let testClient;
  let testTech;

  beforeAll(async () => {
    // 1. Créer un client minimal nécessaire pour l'intervention
    const auth = await prisma.authentification.create({
      data: {
        email: 'test-client@test.com',
        mot_passe_hash: 'hash',
        Role: 'CLIENT',
        client: { create: { nom: 'Test', prenom: 'Client', adresse: '...', code_postal: '...', ville: '...' } }
      }
    });
    testClient = auth.client;

    // 2. Créer un technicien
    const authTech = await prisma.authentification.create({
      data: {
        email: 'test-tech@test.com',
        mot_passe_hash: 'hash',
        Role: 'TECHNICIEN',
        technicien: { create: { nom: 'Test', prenom: 'Tech', telephone: '0600000000' } }
      }
    });
    testTech = authTech.technicien;
  });

  it('devrait créer une intervention', async () => {
    const intervention = await prisma.intervention.create({
      data: {
        date_intervention: new Date(),
        id_client: testClient.id_client,
        id_technicien: testTech.id_technicien,
        statut: 'PLANIFIEE'
      }
    });
    expect(intervention).toBeDefined();
    expect(intervention.id_intervention).toBeDefined();
  });
});
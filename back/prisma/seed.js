import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Début du peuplement de la base de données...");

  // Génération d'un hash valide pour le mot de passe (ex: "Password123")
  const hashedPassword = await bcrypt.hash('Password123', 10);

  // 1. Création d'un Admin
  const adminAuth = await prisma.authentification.upsert({
    where: { email: 'admin@hch.com' },
    update: {},
    create: {
      email: 'admin@hch.com',
      mot_passe_hash: hashedPassword,
      Role: Role.ADMIN,
      administrateur: {
        create: { nom: 'Admin Test' },
      },
    },
  });

  // 2. Création d'un Technicien
  const techAuth = await prisma.authentification.upsert({
    where: { email: 'tech@hch.com' },
    update: {},
    create: {
      email: 'tech@hch.com',
      mot_passe_hash: hashedPassword,
      Role: Role.TECHNICIEN,
      technicien: {
        create: {
          nom: 'Durand',
          prenom: 'Thomas',
          telephone: '0601020304',
        },
      },
    },
  });

  // 3. Création d'un Client avec un Vélo
  const clientAuth = await prisma.authentification.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      mot_passe_hash: hashedPassword,
      Role: Role.CLIENT,
      client: {
        create: {
          nom: 'Dupont',
          prenom: 'Marie',
          telephone: '0698765432',
          adresse: '15 rue de la République',
          code_postal: '64000',
          ville: 'Pau',
          velos: {
            create: {
              marque: 'Decathlon',
              modele: 'Elops 520',
              annee: 2023,
              type_velo: 'Ville',
            },
          },
        },
      },
    },
  });

  // 4. Création d'un Forfait de test
  await prisma.forfait.create({
    data: {
      nom: 'Révision Classique',
      description: 'Réglage des freins et des vitesses, gonflage.',
      prix: 35.00,
      duree_minutes: 45,
      actif: true,
      type_velo: 'Ville',
    },
  });

  console.log("✅ Données fictives insérées avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
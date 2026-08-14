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

  // 1. ENTREPRISE
  const entreprise = await prisma.entreprise.create({
    data: {
      nom: "Home Cycl'Home Lyon",
      siret: "12345678901234",
      adresse: "10 Rue de la République",
      code_postal: "69002",
      ville: "Lyon"
    }
  });

  // 2. ADMIN
  await prisma.authentification.create({
    data: {
      email: 'admin@hch.com',
      mot_passe_hash: hashedPassword,
      Role: Role.ADMIN,
      administrateur: { create: { nom: 'Super Admin' } }
    }
  });

  // 3. ZONES LYON (Pour répondre à votre besoin spécifique)
  const zones = [
    { nom: 'Lyon Centre', frais_deplacement: 5.00 },
    { nom: 'Lyon 7ème', frais_deplacement: 8.00 },
    { nom: 'Villeurbanne', frais_deplacement: 10.00 }
  ];

  for (const z of zones) {
    await prisma.zone.create({ data: z });
  }

  // 4. FORFAITS & PRODUITS
  const forfait = await prisma.forfait.create({
    data: { nom: 'Révision Complète', prix: 49.90, duree_minutes: 60, type_velo: 'Tous' }
  });

  const produit = await prisma.produit.create({
    data: { nom: 'Chambre à air', prix: 8.50 }
  });

  // 5. BOUCLE POUR PLUSIEURS CLIENTS ET VELOS
  for (let i = 1; i <= 3; i++) {
    const clientAuth = await prisma.authentification.create({
      data: {
        email: `client${i}@test.com`,
        mot_passe_hash: hashedPassword,
        Role: Role.CLIENT,
        client: {
          create: {
            nom: `Client${i}`,
            prenom: 'Test',
            adresse: `${i} rue de Lyon`,
            code_postal: '69001',
            ville: 'Lyon',
            velos: {
              create: {
                marque: 'Giant',
                modele: 'Escape',
                annee: 2022,
                type_velo: 'VTC'
              }
            }
          }
        }
      }
    });
  }

  // 6. TECHNICIEN
  const technicienAuth = await prisma.authentification.create({
    data: {
      email: 'tech@hch.com',
      mot_passe_hash: hashedPassword,
      Role: Role.TECHNICIEN,
      technicien: {
        create: { nom: 'Martin', prenom: 'Julien', telephone: '0600000000' }
      }
    }
  });

  const technicien = await prisma.technicien.findFirst(); // ou stockez la variable lors de la création
  const forfaitInter = await prisma.forfait.findFirst();
const zone = await prisma.zone.findFirst();
const client = await prisma.client.findFirst();

// Création d'une intervention
await prisma.intervention.create({
  data: {
    date_intervention: new Date(),
    statut: 'PLANIFIEE',
    adresse_intervention: '10 rue de la République, Lyon',
    montant: 49.90,
    id_technicien: technicien?.id_technicien,
    id_client: client?.id_client,
    id_forfait: forfaitInter?.id_forfait,
    id_zone: zone?.id_zone,
    // Note : id_velo est optionnel, mais vous pouvez le récupérer aussi
  }
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
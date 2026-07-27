// Singleton Prisma — connexion unique à PostgreSQL via @prisma/adapter-pg
// Compétence CDA : Concevoir et mettre en place une base de données relationnelle
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL est manquant dans les variables d\'environnement');
}

const adapter = new PrismaPg({ connectionString });

// Pattern singleton pour éviter de multiples connexions (important en dev avec nodemon)
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
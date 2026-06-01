const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword } = require('../utils/auth');

const registerClient = async (data) => {
  const hashedPassword = await hashPassword(data.mot_passe);
  
  return await prisma.authentification.create({
    data: {
      email: data.email,
      mot_passe_hash: hashedPassword,
      Role: 'CLIENT',
      client: {
        create: {
          nom: data.nom,
          prenom: data.prenom,
          adresse: data.adresse,
          code_postal: data.code_postal,
          ville: data.ville
        }
      }
    }
  });
};

module.exports = { registerClient };
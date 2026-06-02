import { hashPassword } from'../utils/auth.js';


export const registerClient = async (data) => {
  const hashedPassword = await hashPassword(data.mot_passe);
  
  return await authentification.create({
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
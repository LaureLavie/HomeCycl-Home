// RESA-09/10/11 : Service inscription client post-réservation
// Compétence CDA : Développer des composants métier
// US-23 : Création de compte client (flux première réservation)
import { prisma } from '../lib/prisma.js';
import { hashPassword, generateToken } from '../utils/auth.js';

// ─────────────────────────────────────────────
// US-23 : Finaliser l'inscription après première réservation
//
// FLUX :
//   Client réserve → pas de compte → intervention créée sans id_client
//   → Redirect vers /inscription?id_intervention=uuid
//   → Client remplit formulaire (email, mot de passe, infos)
//   → On crée le compte + on rattache l'intervention
// ─────────────────────────────────────────────

export const finaliserInscription = async (data) => {
  const {
    email,
    mot_passe,
    nom,
    prenom,
    telephone,
    adresse,
    code_postal,
    ville,
    id_intervention_temp,
  } = data;

  // Vérifie l'unicité de l'email
  const existing = await prisma.authentification.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Cette adresse email est déjà utilisée');
    error.statusCode = 409;
    throw error;
  }

  const mot_passe_hash = await hashPassword(mot_passe);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Créer l'authentification
    const auth = await tx.authentification.create({
      data: { email, mot_passe_hash, Role: 'CLIENT' },
    });

    // 2. Créer le profil client
    const client = await tx.client.create({
      data: {
        nom,
        prenom,
        telephone: telephone || null,
        adresse,
        code_postal,
        ville,
        id_authentification: auth.id_authentification,
      },
    });

    // 3. Rattacher l'intervention temporaire si fournie
    if (id_intervention_temp) {
      const intervention = await tx.intervention.findUnique({
        where: { id_intervention: id_intervention_temp },
        select: { id_client: true },
      });

      // Rattache uniquement si elle n'appartient encore à personne
      if (intervention && !intervention.id_client) {
        await tx.intervention.update({
          where: { id_intervention: id_intervention_temp },
          data: { id_client: client.id_client },
        });
      }
    }

    return { auth, client };
  });

  // Connexion automatique après inscription (AUTH-08)
  const token = generateToken(result.auth);

  return {
    token,
    user: {
      id: result.auth.id_authentification,
      email: result.auth.email,
      role: result.auth.Role,
      nom: result.client.nom,
      prenom: result.client.prenom,
    },
    // Hint pour le front : rediriger vers le tableau de bord client
    redirect: '/client/dashboard',
  };
};
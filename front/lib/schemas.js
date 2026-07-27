// Schémas de validation côté client — miroir de src/validators/*.js du backend.
// Objectif : donner un retour immédiat et accessible à l'utilisateur, AVANT l'appel API.
// Le backend reste la source de vérité (revalidation systématique côté serveur).
import { z } from 'zod';

const passwordRule = z
  .string({ required_error: 'Le mot de passe est obligatoire' })
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Le mot de passe doit contenir une minuscule, une majuscule et un chiffre'
  );

export const loginSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .min(1, "L'email est obligatoire")
    .email("Format d'email invalide"),
  mot_passe: z.string({ required_error: 'Le mot de passe est obligatoire' }).min(1, 'Le mot de passe est obligatoire'),
});

export const signupSchema = z
  .object({
    email: z
      .string({ required_error: "L'email est obligatoire" })
      .min(1, "L'email est obligatoire")
      .email("Format d'email invalide")
      .max(50, "L'email ne doit pas dépasser 50 caractères"),
    mot_passe: passwordRule,
    role: z.enum(['ADMIN', 'TECHNICIEN', 'CLIENT'], {
      required_error: 'Le rôle est obligatoire',
    }),
    nom: z.string({ required_error: 'Le nom est obligatoire' }).min(1, 'Le nom est obligatoire').max(50),
    prenom: z.string({ required_error: 'Le prénom est obligatoire' }).min(1, 'Le prénom est obligatoire').max(50),
    telephone: z.string().max(20).optional().or(z.literal('')),
    adresse: z.string().max(255).optional().or(z.literal('')),
    code_postal: z.string().max(10).optional().or(z.literal('')),
    ville: z.string().max(255).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'CLIENT') {
      if (!data.adresse) {
        ctx.addIssue({ code: 'custom', path: ['adresse'], message: "L'adresse est obligatoire pour un client" });
      }
      if (!data.code_postal) {
        ctx.addIssue({ code: 'custom', path: ['code_postal'], message: 'Le code postal est obligatoire pour un client' });
      }
      if (!data.ville) {
        ctx.addIssue({ code: 'custom', path: ['ville'], message: 'La ville est obligatoire pour un client' });
      }
    }
    if (data.role === 'TECHNICIEN' && !data.telephone) {
      ctx.addIssue({ code: 'custom', path: ['telephone'], message: 'Le téléphone est obligatoire pour un technicien' });
    }
  });

// Création d'utilisateur par un admin — même contrat que l'inscription publique
export const userAdminCreateSchema = signupSchema;

export const userAdminUpdateSchema = z.object({
  nom: z.string().max(50).optional().or(z.literal('')),
  prenom: z.string().max(50).optional().or(z.literal('')),
  telephone: z.string().max(20).optional().or(z.literal('')),
  adresse: z.string().max(255).optional().or(z.literal('')),
  code_postal: z.string().max(10).optional().or(z.literal('')),
  ville: z.string().max(255).optional().or(z.literal('')),
});

export const clientUpdateSchema = z.object({
  nom: z.string().max(50).optional().or(z.literal('')),
  prenom: z.string().max(50).optional().or(z.literal('')),
  telephone: z.string().max(20).optional().or(z.literal('')),
  adresse: z.string().max(255).optional().or(z.literal('')),
  code_postal: z
    .string()
    .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres')
    .optional()
    .or(z.literal('')),
  ville: z.string().max(255).optional().or(z.literal('')),
});

export const entrepriseSchema = z.object({
  nom: z.string({ required_error: "Le nom de l'entreprise est obligatoire" }).min(1, "Le nom de l'entreprise est obligatoire").max(100),
  siret: z
    .string()
    .regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres')
    .optional()
    .or(z.literal('')),
  adresse: z.string().max(255).optional().or(z.literal('')),
  code_postal: z
    .string()
    .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres')
    .optional()
    .or(z.literal('')),
  ville: z.string().max(255).optional().or(z.literal('')),
  telephone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email("Format d'email invalide").max(200).optional().or(z.literal('')),
  site_web: z.string().url("Format d'URL invalide").max(255).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

/** Convertit une ZodError en { champ: message } pour l'affichage inline des erreurs */
export function toFieldErrors(zodError) {
  const out = {};
  for (const issue of zodError.issues) {
    const key = issue.path.join('.') || '_global';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
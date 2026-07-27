// AUTH-01 / AUTH-02 : Validation des données d'entrée (Zod)
// Compétence CDA : Développer des composants métier + Sécurité
import { z } from 'zod';

// --- Inscription ---
export const signupSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("Format d'email invalide")
    .max(50, "L'email ne doit pas dépasser 50 caractères"),

  mot_passe: z
    .string({ required_error: 'Le mot de passe est obligatoire' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),

  role: z.enum(['ADMIN', 'TECHNICIEN', 'CLIENT'], {
    required_error: 'Le rôle est obligatoire',
    invalid_type_error: "Le rôle doit être ADMIN, TECHNICIEN ou CLIENT",
  }),

  // Champs profil communs
  nom: z
    .string({ required_error: 'Le nom est obligatoire' })
    .min(1, 'Le nom est obligatoire')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),

  prenom: z
    .string({ required_error: 'Le prénom est obligatoire' })
    .min(1, 'Le prénom est obligatoire')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),

  telephone: z
    .string()
    .max(20, 'Le téléphone ne doit pas dépasser 20 caractères')
    .optional(),

  // Champs spécifiques CLIENT
  adresse: z.string().max(255).optional(),
  code_postal: z.string().max(10).optional(),
  ville: z.string().max(255).optional(),
});

// --- Connexion ---
export const loginSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("Format d'email invalide"),

  mot_passe: z
    .string({ required_error: 'Le mot de passe est obligatoire' })
    .min(1, 'Le mot de passe est obligatoire'),
});

// --- Mise à jour utilisateur ---
export const updateUserSchema = z.object({
  nom: z.string().max(50).optional(),
  prenom: z.string().max(50).optional(),
  telephone: z.string().max(20).optional(),
  adresse: z.string().max(255).optional(),
  code_postal: z.string().max(10).optional(),
  ville: z.string().max(255).optional(),
  actif: z.boolean().optional(),
});
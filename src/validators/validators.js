// ENT-01 / USER-01 / CLIENT-01 : Modèles de validation des données
// Compétence CDA : Développer des composants métier + Sécurité (validation entrées)
import { z } from 'zod';

// ─────────────────────────────────────────────
// US-04 : Entreprise
// ─────────────────────────────────────────────
 
export const createEntrepriseSchema = z.object({
  nom: z
    .string({ required_error: 'Le nom de l\'entreprise est obligatoire' })
    .min(1, 'Le nom est obligatoire')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
 
  siret: z
    .string()
    .length(14, 'Le SIRET doit contenir exactement 14 chiffres')
    .regex(/^\d{14}$/, 'Le SIRET ne doit contenir que des chiffres')
    .optional()
    .or(z.literal('')),
 
  adresse: z.string().max(255).optional(),
  code_postal: z
    .string()
    .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres')
    .optional()
    .or(z.literal('')),
  ville: z.string().max(255).optional(),
  telephone: z.string().max(20).optional(),
 
  email: z
    .string()
    .email('Format d\'email invalide')
    .max(200)
    .optional()
    .or(z.literal('')),
 
  site_web: z
    .string()
    .url('Format d\'URL invalide')
    .max(255)
    .optional()
    .or(z.literal('')),
 
  description: z.string().optional(),
  logo_url: z.string().max(500).optional(),
});
 
// Mise à jour = tous les champs optionnels
export const updateEntrepriseSchema = createEntrepriseSchema.partial();
 
// ─────────────────────────────────────────────
// US-05 : Utilisateurs (Admin view)
// ─────────────────────────────────────────────
 
export const createUserAdminSchema = z.object({
  email: z
    .string({ required_error: 'L\'email est obligatoire' })
    .email('Format d\'email invalide')
    .max(50),
 
  mot_passe: z
    .string({ required_error: 'Le mot de passe est obligatoire' })
    .min(8, 'Minimum 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),
 
  role: z.enum(['ADMIN', 'TECHNICIEN', 'CLIENT'], {
    required_error: 'Le rôle est obligatoire',
  }),
 
  nom: z.string().min(1).max(50),
  prenom: z.string().min(1).max(50),
  telephone: z.string().max(20).optional(),
 
  // CLIENT uniquement
  adresse: z.string().max(255).optional(),
  code_postal: z.string().max(10).optional(),
  ville: z.string().max(255).optional(),
});
 
export const updateUserAdminSchema = z.object({
  nom: z.string().max(50).optional(),
  prenom: z.string().max(50).optional(),
  telephone: z.string().max(20).optional(),
  adresse: z.string().max(255).optional(),
  code_postal: z.string().max(10).optional(),
  ville: z.string().max(255).optional(),
  actif: z.boolean().optional(),
});
 
// ─────────────────────────────────────────────
// US-06 : Clients
// ─────────────────────────────────────────────
 
// RU seulement (pas de création côté admin — le client crée son propre compte)
export const updateClientSchema = z.object({
  nom: z.string().max(50).optional(),
  prenom: z.string().max(50).optional(),
  telephone: z.string().max(20).optional(),
  adresse: z.string().max(255).optional(),
  code_postal: z
    .string()
    .regex(/^\d{5}$/, 'Code postal invalide')
    .optional()
    .or(z.literal('')),
  ville: z.string().max(255).optional(),
});
 
// Paramètre de pagination commun aux listes
export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n >= 1, 'La page doit être >= 1')
    .optional()
    .default('1'),
 
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, 'La limite doit être entre 1 et 100')
    .optional()
    .default('20'),
 
  search: z.string().max(100).optional(),
});
 
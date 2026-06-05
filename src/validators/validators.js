// ENT-01 / USER-01 / CLIENT-01 / INTER-01: Modèles de validation des données
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

 
// ─────────────────────────────────────────────
// US-07 : Interventions — INTERV-01
// ─────────────────────────────────────────────
 
// Statuts autorisés (reflète la logique métier)
const STATUTS_INTERVENTION = Object.freeze([
  'PLANIFIEE',
  'EN_COURS',
  'TERMINEE',
  'ANNULEE',
  'ABSENT_CLIENT',
]);

export const createInterventionSchema = z.object({
  date_intervention: z
    .string({ required_error: 'La date est obligatoire' })
    .datetime({ message: 'Format de date invalide (ISO 8601 attendu)' }),
 
  heure_debut: z.string().datetime().optional(),
  heure_fin: z.string().datetime().optional(),
 
  adresse_intervention: z
    .string()
    .max(255, "L'adresse ne doit pas dépasser 255 caractères")
    .optional(),
 
  commentaire: z.string().optional(),
 
  // Relations optionnelles (peuvent être affectées plus tard)
  id_zone: z.string().uuid('ID zone invalide').optional(),
  id_technicien: z.string().uuid('ID technicien invalide').optional(),
  id_forfait: z.string().uuid('ID forfait invalide').optional(),
  id_velo: z.string().uuid('ID vélo invalide').optional(),
  id_client: z.string().uuid('ID client invalide').optional(),
 
  // Produits additionnels à inclure
  produits: z
    .array(
      z.object({
        id_produit: z.string().uuid('ID produit invalide'),
        quantite: z.number().int().min(1, 'Quantité minimale : 1').default(1),
      })
    )
    .optional(),
});
 
export const updateInterventionSchema = z.object({
  date_intervention: z.string().datetime().optional(),
  heure_debut: z.string().datetime().optional(),
  heure_fin: z.string().datetime().optional(),
  statut: z.enum(STATUTS_INTERVENTION).optional(),
  adresse_intervention: z.string().max(255).optional(),
  montant: z.number().nonnegative('Le montant ne peut pas être négatif').optional(),
  commentaire: z.string().optional(),
  id_zone: z.string().uuid().optional(),
  id_technicien: z.string().uuid().optional(),
  id_forfait: z.string().uuid().optional(),
  id_velo: z.string().uuid().optional(),
  id_client: z.string().uuid().optional(),
  produits: z
    .array(
      z.object({
        id_produit: z.string().uuid(),
        quantite: z.number().int().min(1).default(1),
      })
    )
    .optional(),
});
 
// Filtre de liste interventions
export const filtreInterventionSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  statut: z.enum(STATUTS_INTERVENTION).optional(),
  id_technicien: z.string().uuid().optional(),
  id_zone: z.string().uuid().optional(),
  date_debut: z.string().datetime().optional(),
  date_fin: z.string().datetime().optional(),
});
 
// ─────────────────────────────────────────────
// US-08 : Forfaits (tarifs interventions) — INTERV-06
// ─────────────────────────────────────────────
 
export const createForfaitSchema = z.object({
  nom: z
    .string({ required_error: 'Le nom du forfait est obligatoire' })
    .min(1)
    .max(100),
 
  description: z.string().optional(),
 
  prix: z
    .number({ required_error: 'Le prix est obligatoire' })
    .nonnegative('Le prix ne peut pas être négatif'),
 
  duree_minutes: z
    .number({ required_error: 'La durée est obligatoire' })
    .int()
    .min(15, 'Durée minimale : 15 minutes')
    .max(480, 'Durée maximale : 8 heures'),
 
  type_velo: z
    .string()
    .max(100)
    .optional(),
 
  actif: z.boolean().default(true),
});
 
export const updateForfaitSchema = createForfaitSchema.partial();
 
// ─────────────────────────────────────────────
// US-09 : Produits additionnels — INTERV-11
// ─────────────────────────────────────────────
 
export const createProduitSchema = z.object({
  nom: z
    .string({ required_error: 'Le nom du produit est obligatoire' })
    .min(1)
    .max(100),
 
  description: z.string().optional(),
 
  prix: z
    .number({ required_error: 'Le prix est obligatoire' })
    .nonnegative('Le prix ne peut pas être négatif'),
 
  actif: z.boolean().default(true),
});
 
export const updateProduitSchema = createProduitSchema.partial();
 
// ─────────────────────────────────────────────
// US-10 : Zones géographiques — MAP-02
// ─────────────────────────────────────────────
 
export const createZoneSchema = z.object({
  nom: z
    .string({ required_error: 'Le nom de la zone est obligatoire' })
    .min(1)
    .max(50),
 
  description: z.string().optional(),
 
  // GeoJSON stocké en TEXT — validé comme string JSON valide
  geojson: z
    .string()
    .refine(
      (val) => {
        try { JSON.parse(val); return true; }
        catch { return false; }
      },
      { message: 'Le GeoJSON doit être un JSON valide' }
    )
    .optional(),
 
  frais_deplacement: z
    .number()
    .nonnegative('Les frais ne peuvent pas être négatifs')
    .optional(),
});
 
export const updateZoneSchema = createZoneSchema.partial();
 
// Attribution zone → technicien
export const assignerTechnicienSchema = z.object({
  id_technicien: z.string().uuid('ID technicien invalide'),
  id_modele_planification: z.string().uuid('ID modèle invalide'),
});

// ─────────────────────────────────────────────
// Filtre interventions technicien — US-12 / US-13
// TECH-01 / TECH-05
// ─────────────────────────────────────────────
 

export const filtreInterventionTechSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n >= 1)
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100)
    .optional()
    .default('20'),
  // Filtre par statut (US-19 : TECH-18 filtre interventions finies)
  statut: z.enum(STATUTS_INTERVENTION).optional(),
  // Filtre par date (US-13 : planning semaine)
  date_debut: z.string().datetime().optional(),
  date_fin: z.string().datetime().optional(),
  // Filtre jour spécifique (planning du jour)
  date_jour: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : YYYY-MM-DD')
    .optional(),
});
 
// ─────────────────────────────────────────────
// Modification intervention par le technicien — US-12
// TECH-02 : formulaire pré-rempli (champs limités au rôle TECHNICIEN)
// Le technicien ne peut PAS modifier : id_client, id_zone, id_forfait, date
// Il peut modifier : commentaire, statut (limité), heure_debut, heure_fin
// ─────────────────────────────────────────────
 
export const updateInterventionTechSchema = z.object({
  commentaire: z.string().max(2000).optional(),
  heure_debut: z.string().datetime().optional(),
  heure_fin: z.string().datetime().optional(),
  // US-19 : seul le statut EN_COURS est accessible librement
  // TERMINEE et ANNULEE ont leurs propres endpoints dédiés
  statut: z
    .enum(['EN_COURS', 'PLANIFIEE', 'ABSENT_CLIENT'])
    .optional(),
  // Ajout de produits pendant l'intervention (US-12)
  produits: z
    .array(
      z.object({
        id_produit: z.string().uuid('ID produit invalide'),
        quantite: z.number().int().min(1).default(1),
      })
    )
    .optional(),
});
 
// ─────────────────────────────────────────────
// Commentaire seul — US-18 TECH-15
// ─────────────────────────────────────────────
 
export const commentaireSchema = z.object({
  commentaire: z
    .string({ required_error: 'Le commentaire est obligatoire' })
    .min(1, 'Le commentaire ne peut pas être vide')
    .max(2000, 'Le commentaire ne doit pas dépasser 2000 caractères'),
});
 
// ─────────────────────────────────────────────
// Annulation d'intervention — US-20 TECH-19
// ─────────────────────────────────────────────
 
export const annulationSchema = z.object({
  motif: z
    .string()
    .max(500, 'Le motif ne doit pas dépasser 500 caractères')
    .optional(),
});
 
// ─────────────────────────────────────────────
// Modification client par le technicien — US-14 TECH-07
// Le technicien peut modifier des infos de contact uniquement
// ─────────────────────────────────────────────
 
export const updateClientTechSchema = z.object({
  telephone: z
    .string()
    .max(20, 'Le téléphone ne doit pas dépasser 20 caractères')
    .optional(),
  adresse: z.string().max(255).optional(),
  code_postal: z
    .string()
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
    .optional()
    .or(z.literal('')),
  ville: z.string().max(255).optional(),
  // Le technicien ne peut PAS changer nom, prenom, email
});
 
// ─────────────────────────────────────────────
// Upload photo — US-17 TECH-12
// Validation des métadonnées (le fichier est géré par multer)
// ─────────────────────────────────────────────
 
export const photoMetaSchema = z.object({
  // Type de photo : avant ou après intervention
  type: z.enum(['AVANT', 'APRES', 'DETAIL'], {
    required_error: 'Le type de photo est obligatoire',
    invalid_type_error: "Le type doit être AVANT, APRES ou DETAIL",
  }),
});
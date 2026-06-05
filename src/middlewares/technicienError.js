// TECH-04 : Middleware de vérification d'appartenance
// Compétence CDA : Développer des composants métier — Sécurité RBAC
// Vérifie qu'un technicien n'accède qu'à SES propres interventions/clients
import { prisma } from '../lib/prisma.js';

// ─────────────────────────────────────────────
// Vérifie que l'intervention appartient au technicien connecté
// Usage : router.get('/:id', auth, authorize(['TECHNICIEN']), checkOwnsIntervention, ctrl)
// ─────────────────────────────────────────────

export const checkOwnsIntervention = async (req, res, next) => {
  try {
    // L'ADMIN bypasse toujours cette vérification
    if (req.user.role === 'ADMIN') return next();

    const intervention = await prisma.intervention.findUnique({
      where: { id_intervention: req.params.id },
      select: { id_technicien: true, statut: true },
    });

    if (!intervention) {
      return res.status(404).json({
        success: false,
        message: 'Intervention introuvable',
      });
    }

    // Récupère l'id_technicien lié au compte connecté
    const technicien = await prisma.technicien.findUnique({
      where: { id_authentification: req.user.id },
      select: { id_technicien: true },
    });

    if (!technicien || intervention.id_technicien !== technicien.id_technicien) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : cette intervention ne vous est pas assignée",
      });
    }

    // Injecte dans req pour éviter une 2ème requête BDD dans le contrôleur
    req.technicien = technicien;
    req.intervention = intervention;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────
// Récupère et injecte le technicien connecté dans req.technicien
// Middleware léger à placer sur toutes les routes technicien
// ─────────────────────────────────────────────

export const injectTechnicien = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next();

    const technicien = await prisma.technicien.findUnique({
      where: { id_authentification: req.user.id },
      select: { id_technicien: true, nom: true, prenom: true },
    });

    if (!technicien) {
      return res.status(404).json({
        success: false,
        message: 'Profil technicien introuvable. Contactez l\'administrateur.',
      });
    }

    req.technicien = technicien;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
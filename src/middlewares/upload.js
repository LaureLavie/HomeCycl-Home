// TECH-12/13 : Middleware upload photos (Multer)
// Compétence CDA : Développer des composants métier — Gestion fichiers
// US-17 : Déposer photos dans intervention
//
// Stratégie MVP : stockage local dans /uploads/interventions/
// Évolution future : remplacer par AWS S3 ou Cloudinary
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────
// Dossier de stockage
// ─────────────────────────────────────────────

const UPLOAD_DIR = path.join(__dirname, '../../uploads/interventions');

// Crée le dossier s'il n'existe pas (démarrage serveur)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─────────────────────────────────────────────
// Configuration Multer
// ─────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organise par intervention : /uploads/interventions/{id_intervention}/
    const interventionDir = path.join(UPLOAD_DIR, req.params.id || 'general');
    if (!fs.existsSync(interventionDir)) {
      fs.mkdirSync(interventionDir, { recursive: true });
    }
    cb(null, interventionDir);
  },

  filename: (req, file, cb) => {
    // Nom de fichier unique : timestamp + extension originale
    const extension = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const nomFichier = `photo_${timestamp}${extension}`;
    cb(null, nomFichier);
  },
});

// Filtre : uniquement les images
const fileFilter = (req, file, cb) => {
  const typesAutorises = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

  if (typesAutorises.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Format non supporté. Formats acceptés : JPEG, PNG, WebP, HEIC'),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Mo max par photo — TECH-14 : gestion erreurs
    files: 5,                    // 5 photos max par requête
  },
});

// ─────────────────────────────────────────────
// Helper : construit l'URL publique de la photo
// ─────────────────────────────────────────────

export const buildPhotoUrl = (idIntervention, nomFichier) => {
  // En MVP : URL relative servie par Express static
  // En prod : remplacer par l'URL CDN (ex: https://cdn.homecyclhome.fr/...)
  return `/uploads/interventions/${idIntervention}/${nomFichier}`;
};

// ─────────────────────────────────────────────
// Middleware de gestion des erreurs Multer (TECH-14)
// ─────────────────────────────────────────────

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier dépasse la taille maximale autorisée (10 Mo)',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas envoyer plus de 5 photos à la fois',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  next();
};
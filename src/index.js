// Point d'entrée du serveur Express
// Compétence CDA : Installer et configurer son environnement de travail
import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/authRoute.js';
import { clientRouter } from './routes/clientRoute.js';
import { entrepriseRouter } from './routes/entrepriseRoute.js';
import { userRouter } from './routes/userRoute.js';
import {
  interventionRouter,
  forfaitRouter,
  produitRouter,
  zoneRouter,
  planningRouter,
} from './routes/interventionRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// Middlewares globaux
// ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Headers de sécurité basiques (à compléter avec helmet en production)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/entreprise', entrepriseRouter);
app.use('/api/client', clientRouter);
app.use('/api/user', userRouter);
app.use('/api/intervention', interventionRouter);
app.use('/api/forfait', forfaitRouter);
app.use('/api/produit', produitRouter);
app.use('/api/zone', zoneRouter);
app.use('/api/planning', planningRouter);


// Route de santé (health check — utile pour le déploiement Docker/VPS)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'HomeCyclHome API', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────
// Gestion des routes inconnues
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.path}' introuvable`,
  });
});

// ─────────────────────────────────────────────
// Gestionnaire d'erreurs global
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
  });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur HomeCyclHome démarré sur http://localhost:${PORT}`);
  console.log(`📋 Environnement : ${process.env.NODE_ENV || 'development'}`);
});
// CONTACT-01 : Route publique du formulaire de contact
// Compétence CDA : Développer des composants métier — Architecture REST
//
// Volontairement AUCUN middleware auth ici : un visiteur sans compte doit
// pouvoir contacter l'atelier (même logique que /api/public et /api/inscription).
import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';
import * as contactController from '../controllers/contactController.js';

export const contactRouter = express.Router();

// POST /api/contact — Envoi d'un message (public)
contactRouter.post('/', contactController.envoyerMessage);

// GET /api/contact — Liste des messages (réservée admin, future vue de gestion)
contactRouter.get('/', auth, authorize(['ADMIN']), contactController.getAllMessages);
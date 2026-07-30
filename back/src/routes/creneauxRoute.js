// back/src/routes/creneauxRoute.js
// PLAN-13 : Recherche de créneaux disponibles
// Route PUBLIQUE — nécessaire au parcours de réservation anonyme (US-21)
import express from 'express';
import * as planningController from '../controllers/planningController.js';

export const creneauxRouter = express.Router();

creneauxRouter.get('/', planningController.getCreneauxDisponibles);
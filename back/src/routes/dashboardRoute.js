// back/src/routes/dashboardRoute.js
// Compétence CDA : Développer des composants métier — Architecture REST
import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';
import * as dashboardController from '../controllers/dashboardController.js';

export const dashboardRouter = express.Router();

dashboardRouter.get('/', auth, authorize(['ADMIN']), dashboardController.getDashboard);
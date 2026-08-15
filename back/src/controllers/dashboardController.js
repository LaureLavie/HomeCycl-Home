// back/src/controllers/dashboardController.js
import * as dashboardService from '../services/dashboardService.js';

export const getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardStats();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
import express from'express';
const router = express.Router();
import { auth } from'../middlewares/auth.js';
import { authorize } from'../middlewares/role.js';
import * as authController from'../controllers/authController.js';

router.post('/signup', authController.signup);
router.post('/login',authController.login);
router.post('/logout',authController.logout);


router.get('/', auth, authorize(['ADMIN']), authController.getAll);
router.delete('/:id', auth, authorize(['ADMIN']), authController.delete);
router.put('/:id', auth, authorize(['ADMIN', 'TECHNICIEN']), authController.update);
router.post('/', auth, authorize(['CLIENT', 'ADMIN']), authController.create);

export default router;
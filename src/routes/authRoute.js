const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login',authController.login);
router.post('/logout',authController.logout);


router.get('/', auth, authorize(['ADMIN']), authController.getAll);
router.delete('/:id', auth, authorize(['ADMIN']), authController.delete);
router.put('/:id', auth, authorize(['ADMIN', 'TECHNICIEN']), authController.update);
router.post('/', auth, authorize(['CLIENT', 'ADMIN']), authController.create);

module.exports = router;
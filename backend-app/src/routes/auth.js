import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import {
  register,
  login,
  refresh,
  logout,
} from '../controllers/authController.js';
const router = Router();

router.post(
  '/register',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate,
  register
);
router.post(
  '/login',
  [body('email').isEmail(), body('password').exists()],
  validate,
  login
);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;

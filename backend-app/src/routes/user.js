import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  me,
  updateProfile,
  uploadAvatar,
  listUsers,
} from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, me);
router.put(
  '/me',
  requireAuth,
  [body('email').optional().isEmail()],
  validate,
  updateProfile
);
router.post('/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.get('/', requireAuth, requireRole('admin'), listUsers);

export default router;

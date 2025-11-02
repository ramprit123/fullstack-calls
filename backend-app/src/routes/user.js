import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { requireClerkAuth, requireRole } from '../middleware/clerkAuth.js';
import {
  me,
  updateProfile,
  uploadAvatar,
  listUsers,
  getUserById,
  updatePreferences,
  updateAddress,
} from '../controllers/userController.js';

const router = Router();

// Current user routes
router.get('/me', requireClerkAuth, me);
router.put(
  '/me',
  requireClerkAuth,
  [
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('address').optional().isObject(),
    body('preferences').optional().isObject(),
  ],
  validate,
  updateProfile
);
router.post(
  '/me/avatar',
  requireClerkAuth,
  upload.single('avatar'),
  uploadAvatar
);
router.put('/me/preferences', requireClerkAuth, updatePreferences);
router.put('/me/address', requireClerkAuth, updateAddress);

// Admin routes
router.get('/', requireClerkAuth, requireRole('admin'), listUsers);
router.get('/:id', requireClerkAuth, requireRole('admin'), getUserById);

export default router;

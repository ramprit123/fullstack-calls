import { Router } from 'express';
import { handleClerkWebhook } from '../controllers/webhookController.js';
import { CLERK_WEBHOOK_SECRET } from '../config/env.js';

const router = Router();

// Test endpoint to verify webhook setup
router.get('/test', (req, res) => {
  res.json({
    message: 'Webhook endpoint is working',
    timestamp: new Date().toISOString(),
    webhookSecretConfigured: !!CLERK_WEBHOOK_SECRET,
  });
});

// Clerk webhook endpoint
router.post('/clerk', handleClerkWebhook);

export default router;

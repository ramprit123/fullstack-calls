import { Router } from 'express';
import { requireClerkAuth } from '../middleware/clerkAuth.js';

const router = Router();

// Test endpoint to verify Clerk authentication
router.get('/protected', requireClerkAuth, (req, res) => {
  res.json({
    message: 'This is a protected route!',
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
    },
  });
});

// Public test endpoint
router.get('/public', (req, res) => {
  res.json({
    message: 'This is a public route - no authentication required!',
    timestamp: new Date().toISOString(),
    cspHeaders: res.getHeader('Content-Security-Policy')
      ? 'CSP Enabled'
      : 'No CSP',
  });
});

// CSP test endpoint
router.get('/csp-info', (req, res) => {
  res.json({
    message: 'CSP Configuration Info',
    headers: {
      'Content-Security-Policy': res.getHeader('Content-Security-Policy'),
      'X-Frame-Options': res.getHeader('X-Frame-Options'),
      'Access-Control-Allow-Origin': res.getHeader(
        'Access-Control-Allow-Origin'
      ),
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default router;

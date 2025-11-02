import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import logger from './config/logger.js';
import rateLimiter from './middleware/rateLimiter.js';
import { createCSPMiddleware } from './middleware/csp.js';
// JWT auth routes removed - using Clerk authentication
import userRoutes from './routes/user.js';
import testRoutes from './routes/test.js';
import webhookRoutes from './routes/webhook.js';
import swagger from './swagger.js';
import { CLIENT_URL } from './config/env.js';

const app = express();

// middlewares - Configure helmet for Clerk compatibility
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https:'],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://*.clerk.accounts.dev',
          'https://*.clerk.com',
          'https://challenges.cloudflare.com',
          'https://cdn.jsdelivr.net',
          'https://unpkg.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://*.clerk.accounts.dev',
          'https://*.clerk.com',
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://*.clerk.accounts.dev',
          'https://*.clerk.com',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https://*.clerk.com',
          'https://*.clerk.accounts.dev',
          'https://img.clerk.com',
        ],
        connectSrc: [
          "'self'",
          'https://*.clerk.accounts.dev',
          'https://*.clerk.com',
          'https://api.clerk.com',
          'https://clerk.accounts.dev',
        ],
        frameSrc: [
          'https://challenges.cloudflare.com',
          'https://*.clerk.accounts.dev',
          'https://*.clerk.com',
        ],
        workerSrc: ["'self'", 'blob:'],
        childSrc: [
          "'self'",
          'https://*.clerk.accounts.dev',
          'https://*.clerk.com',
        ],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for Clerk compatibility
  })
);

app.use(
  cors({
    origin: [CLIENT_URL, 'https://*.clerk.accounts.dev', 'https://*.clerk.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(morgan('combined', { stream: logger.stream }));

// Webhook routes (before JSON parsing for raw body access)
app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  webhookRoutes
);

// Regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimiter);
app.use('/uploads', express.static('uploads'));

// routes
// JWT auth routes removed - using Clerk authentication
app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);

// swagger
app.use('/api-docs', swagger.router);

// Serve React app static files
app.use(express.static(path.join(__dirname, '../../frontend-app/dist')));

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// Catch-all handler for React Router (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend-app/dist/index.html'));
});

// API 404 handler (this won't be reached for non-API routes)
app.use('/api/*', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;

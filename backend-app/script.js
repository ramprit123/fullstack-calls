#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectName = process.argv[2];
if (!projectName) {
  console.error('❌ Usage: node script.js <project-name>');
  process.exit(1);
}

const root = path.join(process.cwd(), projectName);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeFile(relPath, content) {
  const fullPath = path.join(root, relPath);
  await ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content);
}

async function generate() {
  console.log(`🚀 Generating ESM Node.js project: ${projectName}`);

  // package.json
  await writeFile(
    'package.json',
    JSON.stringify(
      {
        name: projectName,
        version: '1.0.0',
        type: 'module',
        scripts: {
          start: 'node src/index.js',
          dev: 'nodemon src/index.js',
        },
        dependencies: {
          bcryptjs: '^2.4.3',
          cookie: '^0.6.0',
          'cookie-parser': '^1.4.6',
          cors: '^2.8.5',
          dotenv: '^16.0.3',
          express: '^4.18.2',
          'express-rate-limit': '^6.8.0',
          'express-validator': '^6.14.3',
          helmet: '^6.0.1',
          jsonwebtoken: '^9.0.0',
          mongoose: '^7.0.0',
          morgan: '^1.10.0',
          multer: '^1.4.5-lts.1',
          uuid: '^9.0.0',
          winston: '^3.8.2',
          'swagger-jsdoc': '^6.2.8',
          'swagger-ui-express': '^4.6.2',
        },
        devDependencies: {
          nodemon: '^3.0.0',
        },
      },
      null,
      2
    )
  );

  await writeFile(
    '.gitignore',
    `node_modules
.env
uploads
.DS_Store
`
  );

  await writeFile(
    '.env.example',
    `PORT=4000
MONGO_URI=mongodb://localhost:27017/${projectName}
JWT_ACCESS_SECRET=replace_access_secret
JWT_REFRESH_SECRET=replace_refresh_secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
`
  );

  await writeFile(
    'README.md',
    `# ${projectName}

Generated Node.js (ESM) + Express + Mongoose project with cookie-based JWT auth.

## Usage

\`\`\`bash
npm install
npm run dev
\`\`\`

Swagger Docs → http://localhost:4000/api-docs
`
  );

  // --- src/index.js
  await writeFile(
    'src/index.js',
    `import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './app.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(\`🚀 Server running on port \${PORT}\`);
});
`
  );

  // --- src/app.js
  await writeFile(
    'src/app.js',
    `import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import rateLimiter from './middleware/rateLimiter.js';
import swagger from './swagger.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

const app = express();
await connectDB();

// middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('combined', { stream: logger.stream }));
app.use(rateLimiter);
app.use('/uploads', express.static('uploads'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// swagger
app.use('/api-docs', swagger.router);

// health
app.get('/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
`
  );

  // --- src/config/db.js
  await writeFile(
    'src/config/db.js',
    `import mongoose from 'mongoose';
import logger from './logger.js';

const MONGO_URI = process.env.MONGO_URI;

export default async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('❌ MongoDB connection failed', err);
    process.exit(1);
  }
}
`
  );

  // --- src/config/logger.js
  await writeFile(
    'src/config/logger.js',
    `import winston from 'winston';

const enumerateErrorFormat = winston.format(info => {
  if (info instanceof Error) Object.assign(info, { message: info.stack });
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

logger.stream = {
  write: message => logger.info(message.trim())
};

export default logger;
`
  );

  // --- Middleware
  await writeFile(
    'src/middleware/rateLimiter.js',
    `import rateLimit from 'express-rate-limit';
export default rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, try later' }
});
`
  );

  await writeFile(
    'src/middleware/validate.js',
    `import { validationResult } from 'express-validator';
export default (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};
`
  );

  await writeFile(
    'src/middleware/auth.js',
    `import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(payload.sub).select('-password');
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
`
  );

  await writeFile(
    'src/middleware/upload.js',
    `import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

function fileFilter(_, file, cb) {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'), false);
  cb(null, true);
}

export default multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
`
  );

  // --- Models
  await writeFile(
    'src/models/Address.js',
    `import mongoose from 'mongoose';
const AddressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String
}, { _id: false });
export default AddressSchema;
`
  );

  await writeFile(
    'src/models/User.js',
    `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AddressSchema from './Address.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileImage: String,
  address: AddressSchema,
  refreshToken: String
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function(pw) {
  return bcrypt.compare(pw, this.password);
};

export default mongoose.model('User', UserSchema);
`
  );

  // --- Utils
  await writeFile(
    'src/utils/token.js',
    `import jwt from 'jsonwebtoken';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const signAccess = user =>
  jwt.sign({ sub: user._id, role: user.role }, ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES });

export const signRefresh = user =>
  jwt.sign({ sub: user._id }, REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });

export const verifyRefresh = token => jwt.verify(token, REFRESH_SECRET);
`
  );

  // --- Controllers & Routes
  await writeFile(
    'src/controllers/authController.js',
    `import User from '../models/User.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/token.js';
import jwt from 'jsonwebtoken';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined
};

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ error: 'Email exists' });
    const user = await User.create({ name, email, password });
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ id: user._id, email, role: user.role });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ id: user._id, email, role: user.role });
  } catch (err) { next(err); }
}

export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    if (!user || user.refreshToken !== token) return res.status(401).json({ error: 'Invalid refresh' });
    const newAccess = signAccess(user);
    const newRefresh = signRefresh(user);
    user.refreshToken = newRefresh;
    await user.save();
    res.cookie('accessToken', newAccess, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Invalid refresh' });
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(payload.sub, { $unset: { refreshToken: 1 } });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  } catch { res.json({ ok: true }); }
}
`
  );

  await writeFile(
    'src/routes/auth.js',
    `import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { register, login, refresh, logout } from '../controllers/authController.js';
const router = Router();

router.post('/register', [body('email').isEmail(), body('password').isLength({ min: 6 })], validate, register);
router.post('/login', [body('email').isEmail(), body('password').exists()], validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
`
  );

  await writeFile(
    'src/controllers/userController.js',
    `import User from '../models/User.js';

export async function me(req, res) {
  const user = await User.findById(req.user._id).select('-password -refreshToken');
  res.json(user);
}

export async function updateProfile(req, res) {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password -refreshToken');
  res.json(user);
}

export async function uploadAvatar(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const user = await User.findByIdAndUpdate(req.user._id, { profileImage: req.file.filename }, { new: true });
  res.json({ ok: true, user });
}

export async function listUsers(req, res) {
  const users = await User.find().select('-password -refreshToken');
  res.json(users);
}
`
  );

  await writeFile(
    'src/routes/user.js',
    `import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { me, updateProfile, uploadAvatar, listUsers } from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, me);
router.put('/me', requireAuth, [body('email').optional().isEmail()], validate, updateProfile);
router.post('/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.get('/', requireAuth, requireRole('admin'), listUsers);

export default router;
`
  );

  await writeFile(
    'src/swagger.js',
    `import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Docs', version: '1.0.0' }
  },
  apis: []
};

const specs = swaggerJSDoc(options);
const router = express.Router();
router.use('/', swaggerUi.serve, swaggerUi.setup(specs));

export default { router };
`
  );

  console.log('✅ Project created successfully!');
  console.log(`👉 Next steps:
  cd ${projectName}
  npm install
  npm run dev
`);
}

generate().catch(console.error);

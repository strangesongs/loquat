import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import compression from 'compression';
import helmet from 'helmet';
import { createClient } from 'redis';
import { RedisStore } from 'rate-limit-redis';
import controllers from './server/controllers/index.js';

const app = express();
const PORT = Number.parseInt(process.env.PORT || '8080', 10);

// Trust the first proxy hop (Railway, etc.) so req.ip returns the real client IP
app.set('trust proxy', 1);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(compression()); // Enable gzip compression
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'https://raw.githubusercontent.com',
          'https://cdnjs.cloudflare.com',
          'https://*.tile.openstreetmap.org',
          'https://tiles.stadiamaps.com',
        ],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Leaflet map tiles require this off
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // needed for Stadia Maps domain auth
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration based on environment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:8080'];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // In production, only allow specified origins
  if (process.env.NODE_ENV === 'production') {
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  } else {
    // In development, allow any origin for easier testing
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

/** One store per limiter (express-rate-limit disallows reusing a single store instance). */
function createRedisRateLimitStore(redisClient, prefix) {
  if (!redisClient) return undefined;
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: `rl:ffa:${prefix}:`,
  });
}

async function createAppWithRateLimiters() {
  let redisClient = null;
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      redisClient.on('error', (err) => console.error('[redis] rate-limit client', err));
      await redisClient.connect();
      console.log('[rate-limit] using Redis (REDIS_URL set)');
    } catch (e) {
      console.error('[rate-limit] Redis connect failed; using in-memory store', e);
      redisClient = null;
    }
  } else {
    console.log('[rate-limit] in-memory (set REDIS_URL for multi-replica limit consistency)');
  }

  const keyGen = (req) => ipKeyGenerator(req.ip ?? '127.0.0.1');
  const limiterDefaults = { standardHeaders: true, legacyHeaders: false, keyGenerator: keyGen };

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    store: createRedisRateLimitStore(redisClient, 'auth'),
    ...limiterDefaults,
  });

  const pinLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many pins created, please slow down.',
    store: createRedisRateLimitStore(redisClient, 'pin'),
    ...limiterDefaults,
  });

  const confirmLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many confirmations, please slow down.',
    store: createRedisRateLimitStore(redisClient, 'confirm'),
    ...limiterDefaults,
  });

  const publicPinsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    message: 'Too many public map requests, please slow down.',
    store: createRedisRateLimitStore(redisClient, 'public'),
    ...limiterDefaults,
  });

  // Serve static files from dist/ at the root FIRST
  app.use(
    express.static(path.join(__dirname, 'dist'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(`${path.sep}sw.js`) || filePath.endsWith(`${path.sep}manifest.json`)) {
          res.setHeader('Cache-Control', 'no-cache');
          return;
        }
        if (filePath.endsWith(`${path.sep}index.html`)) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );

  // Load balancer / monitoring — must be before SPA catch-all
  app.get('/health', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // NOTE: /test static route removed — it exposed project source files in production

  // Serve the built frontend for root
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });

  // Legacy path — must be before SPA catch-all
  app.get('/map', (req, res) => {
    res.redirect(301, '/');
  });

  // Catch-all for client-side routing (SPA) — exclude api, health, legacy paths
  app.get(
    /^\/((?!api|user|save|dist|health).)*$/,
    (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    },
  );

  // Public endpoints (no auth required)
  app.get('/api/locate', controllers.getIpLocation);
  app.get('/api/pins/public', publicPinsLimiter, controllers.getPublicPins);

  // Authentication endpoints
  app.post('/api/auth/register', authLimiter, controllers.registerUser);
  app.post('/api/auth/login', authLimiter, controllers.loginUser);
  app.post('/api/auth/forgot-password', authLimiter, controllers.forgotPassword);
  app.post('/api/auth/reset-password', authLimiter, controllers.resetPassword);

  // Protected API endpoints
  app.get('/api/auth/me', controllers.verifyToken, controllers.getCurrentUser);
  app.post('/api/pins', controllers.verifyToken, pinLimiter, controllers.createPin);
  app.get('/api/pins', controllers.verifyToken, controllers.getAllPins);
  app.get('/api/pins/my', controllers.verifyToken, controllers.getMyPins);
  app.patch('/api/pins/:pinId', controllers.verifyToken, pinLimiter, controllers.updatePin);
  app.delete('/api/pins/:pinId', controllers.verifyToken, controllers.deletePin);
  app.post(
    '/api/pins/:pinId/confirm',
    (req, _res, next) => { req.redisClient = redisClient; next(); },
    confirmLimiter,
    controllers.confirmPin,
  );
}

// Boot
createAppWithRateLimiters()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });

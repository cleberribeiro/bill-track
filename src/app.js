import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyRateLimit from '@fastify/rate-limit';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import billsRoutes from './routes/bills.js';
import monthsRoutes from './routes/months.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PUBLIC_API_PATHS = new Set(['/api/login', '/api/logout']);

function passwordMatches(provided, expected) {
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function buildApp(options = {}) {
  const fastify = Fastify({
    logger: false,
    // Required behind Render/Heroku/etc. so secure session cookies are set over HTTPS.
    trustProxy: process.env.NODE_ENV === 'production' ? 1 : false,
    ...options,
  });

  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.SESSION_SECRET || '';
    if (secret.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters in production');
    }
  }

  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me-please',
    cookieName: 'billtrack.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  });
  await fastify.register(fastifyRateLimit, { global: false });

  await fastify.register(fastifyStatic, {
    root: join(__dirname, 'public'),
    prefix: '/',
  });

  fastify.addHook('preHandler', (req, reply, done) => {
    if (req.url.startsWith('/api') && !PUBLIC_API_PATHS.has(req.url.split('?')[0])) {
      if (!req.session.authenticated) {
        reply.code(401).send({ error: 'Não autenticado' });
        return;
      }
    }
    done();
  });

  fastify.post('/api/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes',
      },
    },
    schema: {
      body: {
        type: 'object',
        required: ['password'],
        properties: { password: { type: 'string' } },
      },
    },
  }, async (req, reply) => {
    const expected = process.env.APP_PASSWORD || '';
    if (!expected || !passwordMatches(req.body.password, expected)) {
      return reply.code(401).send({ error: 'Senha inválida' });
    }
    await req.session.regenerate();
    req.session.authenticated = true;
    return { ok: true };
  });

  fastify.post('/api/logout', (req, reply) => {
    req.session.destroy(() => {
      reply.send({ ok: true });
    });
  });

  await fastify.register(billsRoutes);
  await fastify.register(monthsRoutes);

  fastify.setErrorHandler((error, req, reply) => {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      req.log.error(error);
      return reply.code(statusCode).send({ error: 'Internal Server Error' });
    }
    return reply.code(statusCode).send({ error: error.message });
  });

  return fastify;
}

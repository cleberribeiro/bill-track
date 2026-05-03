import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import billsRoutes from './routes/bills.js';
import monthsRoutes from './routes/months.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function buildApp(options = {}) {
  const fastify = Fastify({ logger: false, ...options });

  await fastify.register(fastifyStatic, {
    root: join(__dirname, 'public'),
    prefix: '/',
  });

  await fastify.register(billsRoutes);
  await fastify.register(monthsRoutes);

  fastify.setErrorHandler((error, req, reply) => {
    const statusCode = error.statusCode || 500;
    reply.code(statusCode).send({ error: error.message });
  });

  return fastify;
}

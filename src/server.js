import { buildApp } from './app.js';
import { initializeSchema } from './db.js';

try {
  await initializeSchema();
  const fastify = await buildApp({ logger: true });
  const port = Number(process.env.PORT) || 3000;
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`BillTrack running on port ${port}`);
} catch (err) {
  console.error(err);
  process.exit(1);
}

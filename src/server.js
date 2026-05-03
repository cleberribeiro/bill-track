import { buildApp } from './app.js';

try {
  const fastify = await buildApp({ logger: true });
  await fastify.listen({ port: 3000, host: '0.0.0.0' });
  console.log('BillTrack running at http://localhost:3000');
} catch (err) {
  console.error(err);
  process.exit(1);
}

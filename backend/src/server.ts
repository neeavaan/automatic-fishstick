import Fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import path from 'path';
import { initDb } from './db/database.js';
import { uploadRoutes } from './routes/upload.js';
import { recordsRoutes } from './routes/records.js';
import { exportRoutes } from './routes/export.js';

const PORT = 3000;
const IS_DEV = process.env.NODE_ENV === 'development';
const DB_PATH = process.env.DB_PATH ?? '/data/app.db';

async function start(): Promise<void> {
  const db = initDb(DB_PATH);

  const app = Fastify({ logger: true });

  if (IS_DEV) {
    await app.register(fastifyCors, { origin: 'http://localhost:5176' });
  }

  await app.register(fastifyMultipart, { limits: { fileSize: 50 * 1024 * 1024 } });

  await app.register(uploadRoutes, { prefix: '/api', db });
  await app.register(recordsRoutes, { prefix: '/api', db });
  await app.register(exportRoutes, { prefix: '/api', db });

  // Serve static frontend in production
  if (!IS_DEV) {
    await app.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
      prefix: '/',
    });

    app.setNotFoundHandler((_req, reply) => {
      reply.sendFile('index.html');
    });
  }

  await app.listen({ port: PORT, host: '0.0.0.0' });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

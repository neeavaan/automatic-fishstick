#!/bin/sh
set -e

# Start Fastify backend with ts-node watch
cd /app/backend && npm run dev &

# Start Vite dev server
cd /app/frontend && npm run dev -- --host 0.0.0.0 &

wait

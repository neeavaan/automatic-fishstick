# ─── Stage 1: build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: production image ────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend/ ./backend/

# Copy built frontend assets
COPY --from=frontend-build /app/frontend/dist ./backend/public

# Ensure data directory exists
RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "backend/dist/server.js"]

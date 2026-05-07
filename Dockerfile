# STAGE 1: Build Frontend
FROM node:20-slim as builder
WORKDIR /app
COPY taskflow-frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY taskflow-frontend/ ./frontend/
RUN cd frontend && npm run build

# STAGE 2: Build Backend & Serve
FROM node:20-slim
WORKDIR /app

# Prevent local .env from overriding Cloud Run config
COPY .dockerignore ./

# Install backend dependencies
COPY taskflow-backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source
COPY taskflow-backend/ ./backend/
# Copy frontend build to the expected path
COPY --from=builder /app/frontend/dist /app/taskflow-frontend/dist

ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app/backend
CMD ["node", "server.js"]

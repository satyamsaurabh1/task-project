# STAGE 1: Build the Frontend
FROM node:24-alpine as frontend-builder
WORKDIR /app/frontend
COPY taskflow-frontend/package*.json ./
RUN npm install
COPY taskflow-frontend/ ./
# Set production environment variable for Vite
ENV VITE_API_URL=/api
RUN npm run build

# STAGE 2: Build the Backend
FROM node:24-alpine
WORKDIR /app
COPY taskflow-backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source
COPY taskflow-backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./taskflow-frontend/dist

# Create uploads directory
RUN mkdir -p backend/uploads

# Expose the port (Cloud Run sets PORT env var)
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the server
WORKDIR /app/backend
CMD ["node", "server.js"]

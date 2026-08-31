# ══════════════════════════════════════════════════════════════
# Montréal 2033: Neural Overload ARPG — Docker Container
# Multi-stage build: install + build + serve
# ══════════════════════════════════════════════════════════════

# Stage 1: Install dependencies & build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Vite production bundle
RUN npm run build

# Stage 2: Serve with Node (Express + Vite static)
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy the built dist folder (includes React static files and server.cjs)
COPY --from=builder /app/dist ./dist

# Install curl for healthcheck (if needed)
RUN apk add --no-cache curl

EXPOSE 80

# The app listens on PORT env variable. We set it to 80 for Cloud Run
ENV PORT=80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/api/sophia/osint/status || exit 1

CMD ["node", "dist/server.cjs"]

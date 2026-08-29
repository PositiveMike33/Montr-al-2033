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

# Stage 2: Serve with lightweight nginx
FROM nginx:alpine AS production

# Copy custom nginx config for SPA routing
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback + reverse proxies for Ollama and STM
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /ollama/ { \
        proxy_pass http://host.docker.internal:11434/; \
        proxy_set_header Host $host; \
        proxy_read_timeout 60s; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

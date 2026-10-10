# Multi-Stage Dockerfile for Fuse React Production Deployment
# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Optimize layer caching for dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code and compile
COPY . .
RUN npm run build

# Stage 2: Serve with Lightweight Production Nginx
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from builder stage (outDir: build)
COPY --from=builder /app/build /usr/share/nginx/html

# Copy optimized SPA nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

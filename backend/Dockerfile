# --- STAGE 1: Build ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for compilation)
RUN npm ci

# Copy source code and config files
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src/ ./src/

# Compile the application to production-ready JS in /dist
RUN npm run build

# Remove development dependencies to keep the image slim
RUN npm prune --production

# --- STAGE 2: Production Run ---
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Copy package files and production node_modules from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Expose the API port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the app under the built-in non-root 'node' user for security
USER node

# Start the NestJS backend
CMD ["node", "dist/main"]

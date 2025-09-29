FROM node:22.16.0-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy packages (dependencies)
COPY packages/ ./packages/

# Copy school-frontend
COPY apps/school-frontend/ ./apps/school-frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages first (if frontend depends on them)
RUN pnpm build:packages

WORKDIR /app/apps/school-frontend

# Expose Vite dev server port
EXPOSE 8080

# Development command
CMD ["pnpm", "dev"]
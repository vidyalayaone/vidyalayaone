FROM node:22.16.0-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy packages (dependencies)
COPY packages/ ./packages/

# Copy attendance-service
COPY apps/attendance-service/ ./apps/attendance-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages first
RUN pnpm build:packages

WORKDIR /app/apps/attendance-service

RUN pnpm prisma generate

# Expose port
EXPOSE 3004

# Development command
CMD ["pnpm", "dev"]

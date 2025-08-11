#!/bin/sh
set -e

echo "Starting database migrations..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run auth service migrations
echo "Running auth service migrations..."
cd /app/apps/auth-service
pnpm db:generate
pnpm db:migrate

# Run school service migrations
echo "Running school service migrations..."
cd /app/apps/school-service
pnpm db:generate
pnpm db:migrate

echo "All migrations completed successfully!"

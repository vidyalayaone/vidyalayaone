#!/bin/sh
set -e

echo "Starting database migrations..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run auth service migrations
echo "Running auth service migrations..."
cd /app/apps/auth-service
export DATABASE_URL=$AUTH_DATABASE_URL
pnpm db:generate
pnpm db:migrate

# Run school service migrations
echo "Running school service migrations..."
cd /app/apps/school-service
export DATABASE_URL=$SCHOOL_DATABASE_URL
pnpm db:generate
pnpm db:migrate

# Run profile service migrations
echo "Running profile service migrations..."
cd /app/apps/profile-service
export DATABASE_URL=$PROFILE_DATABASE_URL
pnpm db:generate
pnpm db:migrate --name init

# Run payment service migrations
echo "Running payment service migrations..."
cd /app/apps/payment-service
export DATABASE_URL=$PAYMENT_DATABASE_URL
pnpm db:generate
pnpm db:migrate --name init

# Run attendance service migrations
echo "Running attendance service migrations..."
cd /app/apps/attendance-service
export DATABASE_URL=$ATTENDANCE_DATABASE_URL
pnpm db:generate
pnpm db:migrate --name init

echo "All migrations completed successfully!"

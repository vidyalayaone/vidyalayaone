# Database Seeding Instructions

This document provides instructions for seeding the databases with initial data.

## Prerequisites

Before you begin, ensure that all microservices are running correctly. You can start them using:

## Seeding Steps

Follow these steps to clean and seed the databases for each service.

### 1. Authentication Service

Clean and seed the authentication database. This command will first clean the database and then run the seed script.

```bash
docker compose exec auth-service sh -c "pnpm db:clean --yes && pnpm db:seed"
```

### 2. School Service

Clean the school database.

```bash
docker compose exec school-service sh -c "pnpm db:clean --yes"
```

### 3. Profile Service

Clean the profile database.

```bash
docker compose exec profile-service sh -c "pnpm db:clean --yes"
```

### 4. Seed Additional Data via Frontend

Run the automation script from the frontend application to seed the remaining data. This script needs to be run from its own directory.

```bash
cd apps/school-frontend && pnpm automate
```
# Setup Guide for OnlyExams Monorepo
## Prerequisites

- **Node.js** v22.16.0>
- **pnpm** 10.12.1>
- **PostgreSQL** (two separate databases for auth-service and tenant-service)
- **Git**

## 1. Clone the Repository

```bash
git clone git@github.com:only-exams/onlyexams.git
cd onlyexams
```

## 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all apps (`api-gateway`, `auth-service`, `tenant-service`) and packages (`common-middleware`, `logger`, etc.)

### Alternate way: Install dependencies for individual apps/packages

Navigate to the specific app or package directory and run `pnpm install`.

Example(app):

```bash
cd apps/auth-service
pnpm install
```

Example(package):

```bash
cd packages/logger
pnpm install
```


## 3. Setup Databases

You need two PostgreSQL databases:

- For Auth Service
- For Tenant Service

You can use any online database provider or create a local postgres database. you will need to will the database urls in the respective .env files

## 4. Configure Environment Variables

For each app, there is a .env.example file. you need to create a .env file for each app taking the .env.example file as a template, just fill your own values there. make sure you are filling the correct database urls that you created in the last step.

## 5. Database Migrations and Seeding

### 5.1 Auth Service

```bash
cd apps/auth-service
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5.2 Tenant Service

```bash
cd apps/tenant-service
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## 6. Running the Services

Navigate to each app directory and run:

```bash
cd apps/api-gateway
pnpm dev
```

```bash
cd apps/auth-service
pnpm dev
```

```bash
cd apps/tenant-service
pnpm dev
```

## 7. Building the Project

### Option 1: Build all apps and packages at once

```bash
pnpm build
```

### Option 2: Build packages and then build individual apps one by one

**Build packages**
Run this from the monorepo root:
```bash
pnpm build:packages
```

**Build apps**

Navigate to each app directory and run:

```bash
cd apps/api-gateway
pnpm dev
```

```bash
cd apps/auth-service
pnpm dev
```

```bash
cd apps/tenant-service
pnpm dev
```

## 8. Starting the Project in Production Mode

**Build everything**
Run this from the monorepo root:
```bash
pnpm build
```

**Start apps**

Navigate to each app directory and run:

```bash
cd apps/api-gateway
pnpm start
```

```bash
cd apps/auth-service
pnpm start
```

```bash
cd apps/tenant-service
pnpm start
```

## 9. Service Ports and URLs

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Tenant Service | 3002 | http://localhost:3002 |

## 10. Testing the Setup

### Health Check Endpoints

- API Gateway: `GET http://localhost:3000/health`
- Auth Service: `GET http://localhost:3001/health`
- Tenant Service: `GET http://localhost:3002/health`

## 11. Additional Notes

- **Database Setup**: Ensure PostgreSQL is running and accessible on the specified ports
- **Environment Variables**: Update `.env` files with your own secrets and credentials
- **Email Configuration**: Configure SendGrid or your preferred SMTP provider for email features
- **JWT Secrets**: Make sure JWT secrets match between API Gateway and Auth Service
- **CORS**: Update CORS origins if running on different domains

## 12. Troubleshooting

### Common Issues

1. **Prisma Migration Errors**:
   ```bash
   cd apps/auth-service
   pnpm db:reset
   pnpm db:migrate
   ```

2. **Port Already in Use**:
   - Check if services are already running
   - Change ports in `.env` files if needed

3. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check database URLs in `.env` files
   - Ensure databases exist

4. **Dependency Issues**:
   ```bash
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

5. **Build Errors**:
   ```bash
   pnpm build:packages
   pnpm build
   ```

### Logs and Debugging

- Check terminal outputs for each service
- Use `pnpm db:studio` to inspect database data
- Enable debug logs by setting `NODE_ENV=development`

## 13. Development Workflow

1. **Start Development**: Run all services using Option A in section 6
2. **Make Changes**: Edit code in respective service directories
3. **Hot Reload**: Services automatically restart on file changes
4. **Test**: Use health check endpoints and test APIs
5. **Build**: Run `pnpm build` before production deployment

Happy coding! 🚀

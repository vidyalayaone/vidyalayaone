# 🛠️ Setup Guide for the OnlyExams Monorepo

## Prerequisites

Ensure you have the following installed:

* **Node.js** v22.16.0
* **pnpm** v10.12.1
* **Git**

---

## 1. Clone the Repository

```bash
git clone git@github.com:only-exams/onlyexams.git
cd onlyexams
```

---

## 2. Install Dependencies

### Option 1: Install all dependencies at once:

```bash
pnpm install
```

This installs dependencies for:

* Applications: `api-gateway`, `auth-service`, `tenant-service`
* Packages: `common-middleware`, `logger`, etc.

### Option 2: Install dependencies individually

You can install dependencies for a specific app or package:

```bash
cd apps/auth-service       # or apps/tenant-service, etc.
pnpm install
```

```bash
cd packages/logger         # or any other package
pnpm install
```

---

## 3. Set Up Databases

Create two PostgreSQL databases—one each for:

* Auth Service
* Tenant Service

These can be local or hosted. You'll need to provide their connection URLs in the respective `.env` files.

---

## 4. Configure Environment Variables

Each app has a `.env.example` file.

### Steps:

1. Copy `.env.example` to `.env` in the same directory.
2. Fill in required values, especially database connection strings.

Repeat this for all apps.

---

## 5. Run Database Migrations and Seed Data

### Auth Service

```bash
cd apps/auth-service
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### Tenant Service

```bash
cd apps/tenant-service
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

---

## 6. Run the Services (Development Mode)

In separate terminals, run each service:

```bash
pnpm build
cd apps/api-gateway && pnpm dev
cd apps/auth-service && pnpm dev
cd apps/tenant-service && pnpm dev
```

---

## 7. Build the Project

### Option 1: Build Everything

```bash
pnpm build
```

### Option 2: Build Packages and Apps Separately

#### Build Packages:

```bash
pnpm build:packages
```

#### Build Apps (individually):

```bash
cd apps/api-gateway && pnpm build
cd apps/auth-service && pnpm build
cd apps/tenant-service && pnpm build
```

---

## 8. Start in Production Mode

### Step 1: Build

```bash
pnpm build
```

### Step 2: Start Services

```bash
cd apps/api-gateway && pnpm start
cd apps/auth-service && pnpm start
cd apps/tenant-service && pnpm start
```

---

## 9. Service URLs and Ports

| Service        | Port | URL                                            |
| -------------- | ---- | ---------------------------------------------- |
| API Gateway    | 3000 | [http://localhost:3000](http://localhost:3000) |
| Auth Service   | 3001 | [http://localhost:3001](http://localhost:3001) |
| Tenant Service | 3002 | [http://localhost:3002](http://localhost:3002) |

---

## 10. Health Check Endpoints

* API Gateway: `GET http://localhost:3000/health`
* Auth Service: `GET http://localhost:3001/health`
* Tenant Service: `GET http://localhost:3002/health`

---

## 11. Configuration Notes

* **PostgreSQL**: Ensure the service is running and accessible.
* **Environment Variables**: Securely store secrets in `.env` files.
* **Email**: Configure SendGrid or SMTP provider in relevant `.env` files.
* **JWT**: Auth and API Gateway must use the same JWT secret.
* **CORS**: Update allowed origins if your frontend runs on a different domain.

---

## 12. Troubleshooting

### Common Problems & Fixes

#### 🔄 Prisma Migration Errors

```bash
cd apps/auth-service
pnpm db:reset
pnpm db:migrate
```

#### 🚫 Port Already in Use

* Ensure no other service is using the port.
* Modify ports in `.env` files if needed.

#### 🔌 Database Connection Errors

* Verify PostgreSQL is running and accessible.
* Check credentials and connection URLs in `.env` files.
* Confirm the databases exist.

#### 📦 Dependency Issues

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 🏗️ Build Failures

```bash
pnpm build:packages
pnpm build
```

### Debugging Tips

* Check service logs in terminal
* Use `pnpm db:studio` for DB inspection
* Set `NODE_ENV=development` for more verbose logs

---

## 13. Development Workflow Summary

1. Start all services (`pnpm dev`)
2. Make code changes
3. Services hot-reload automatically
4. Use health endpoints or test APIs directly
5. Run `pnpm build` before production deployment

---

## ✅ You're All Set

Happy building 🚀

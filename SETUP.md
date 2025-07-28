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

```bash
pnpm install
```

This installs dependencies for:

* Applications: `api-gateway`, `auth-service`, `tenant-service`
* Packages: `common-middleware`, `logger`, etc.

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
```

### Tenant Service

```bash
cd apps/tenant-service
pnpm db:generate
pnpm db:migrate
```

### Profile Service

```bash
cd apps/profile-service
pnpm db:generate
pnpm db:migrate
```

---

## 6. Run the Services (Development Mode)

In separate terminals, run each service:

**Build Packages:**
```bash
pnpm build:packages
```

**Run Auth Service:**
```bash
cd apps/auth-service
pnpm dev
```

**Run Tenant Service:**
```bash
cd apps/tenant-service
pnpm dev
```

**Run Profile Service:**
```bash
cd apps/profile-service
pnpm dev
```

**Run API Gateway:**
```bash
cd apps/api-gateway
pnpm dev
```

---

## 7. Start in Production Mode

### Step 1: Build

```bash
pnpm build
```

### Step 2: Start Services

**Start Auth Service:**
```bash
cd apps/auth-service
pnpm start
```

**Start Tenant Service:**
```bash
cd apps/tenant-service
pnpm start
```

**Start API Gateway:**
```bash
cd apps/api-gateway
pnpm start
```

---

## Configuration Notes

* **PostgreSQL**: Ensure the service is running and accessible.
* **Environment Variables**: Securely store secrets in `.env` files.
* **Email**: Configure SendGrid or SMTP provider in relevant `.env` files.
* **JWT**: Auth and API Gateway must use the same JWT secret.
* **CORS**: Update allowed origins if your frontend runs on a different domain.

---

## Troubleshooting

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

---

## Development Workflow Summary

1. Start all services (`pnpm dev`)
2. Make code changes
3. Services hot-reload automatically
4. Use health endpoints or test APIs directly
5. Run `pnpm build` before production deployment

---

## ✅ You're All Set

Happy building 🚀

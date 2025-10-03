# Backend Services Setup Guide

## 1. Configure Environment Variables

Each backend service comes with a `.env.example` file that contains all the required environment variables along with detailed instructions on how to set them.  

To set up your environment, create a new file named `.env` in the service folder and copy the contents of `.env.example` into it.  

Make sure to **read the guidelines in `.env.example` carefully** to update variables.

> 💡 Tip: If you don’t have a database yet, you can spin up a local Postgres instance using Docker. See [Local Postgres Setup](./DOCKER_DATABASE_SETUP.md) for instructions.

---

## 2. Generate Prisma Client

Generate the Prisma client based on the service schema:

```bash
cd apps/<service-name>
pnpm db:generate
````

---

## 3. Run Database Migrations

Apply the migrations to your database:

```bash
cd apps/<service-name>
pnpm db:migrate
```

> ⚠️ If you are setting up the **auth-service**, also run the following to seed the database with important initial data:

```bash
pnpm db:seed
```

---

## 4. Run the Service in Development Mode

Start the service locally:

```bash
cd apps/<service-name>
pnpm dev
```

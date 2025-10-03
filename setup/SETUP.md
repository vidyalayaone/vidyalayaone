# 🛠️ Setup Guide

## Prerequisites

Ensure you have the following installed:

- **Node.js** v22.16.0  
- **pnpm** v10.12.1  
- **Git**

## 1. Clone the Repository

```bash
git clone https://github.com/vidyalayaone/vidyalayaone.git
cd vidyalayaone
````

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Build Packages

```bash
pnpm build:packages
```

## 4. Setup Services

Follow the instructions in the setup guides for backend and frontend services:

* [Backend Services Setup](./BACKEND_SERVICES_SETUP.md)  
* [Frontend Services Setup](./FRONTEND_SERVICES_SETUP.md)

> ⚠️ Note that you wont be working on all the services together, usually you will work on few services at a time. You only need to set up the services you are working on.

## 5. Seed Data

To populate the databases with some demo data, run the following commands:

```bash
cd apps/school-frontend
pnpm automate
```

## Database Inspection

To inspect a service database, navigate to the service folder and run `pnpm db:studio`:

Example for `auth-service`:

```bash
cd apps/auth-service
pnpm db:studio
```

## Troubleshooting

For common issues and solutions, refer to the [Troubleshooting Guidelines](./TROUBLESHOOTING.md)

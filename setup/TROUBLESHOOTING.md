# 🛠️ Troubleshooting Guide

---

## 1. Installation & Dependency Issues

### 🔹 `pnpm install` fails or hangs
- Ensure you have the correct Node.js version (`v22.16.0`) and `pnpm` (`v10.12.1`).  
- Delete `node_modules` and lockfile, then reinstall:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
````

* Clear pnpm cache:

```bash
pnpm store prune
```

---

### 🔹 Conflicting package versions / dependency errors

* Use `pnpm install --frozen-lockfile` to ensure consistent versions.
* If still failing, check `package.json` for mismatched versions and align them.

---

## 2. Database Issues

### 🔄 Prisma Migration Errors

```bash
cd apps/<service-name>
pnpm db:reset
pnpm db:migrate
```

* Ensure PostgreSQL is running.
* Confirm `.env` has correct database URLs.
* If migrations fail repeatedly, drop the database manually and retry.

### 🔌 Database Connection Errors

* Verify database credentials in `.env`.
* Check that the database exists.
* Ensure no firewall or port conflicts prevent connections.

### ⚠️ Database Studio Won’t Launch

```bash
pnpm db:studio
```

* Ensure correct `pnpm` workspace is active.
* If ports conflict, update `DATABASE_STUDIO_PORT` in `.env`.

---

## 3. Port Conflicts

### 🚫 Port Already in Use

* Check running processes using the port:

```bash
lsof -i :<port>   # macOS/Linux
netstat -ano | findstr <port>  # Windows
```

* Stop conflicting services or change the port in `.env`.
* Ensure no old instances of Node.js apps are running.

---

## 4. Build & Runtime Issues

### 🏗️ Build Failures

```bash
pnpm build:packages
pnpm build
```

* Ensure all dependencies are installed.
* Remove `node_modules` and lockfile if persistent errors occur.
* Check for missing or misconfigured environment variables.

### ⚠️ Runtime Errors / Unexpected Crashes

* Check logs in terminal for stack traces.
* Ensure correct `.env` file is loaded.
* Restart the service if changes were made to `.env` or configs.

---

## 5. Git & Repo Issues

### 🔹 Merge Conflicts

* Use:

```bash
git pull --rebase
```

* Resolve conflicts manually and commit changes.
* Avoid force-pushing unless absolutely necessary.

### 🔹 Missing Files or Branches

* Ensure you are on the correct branch:

```bash
git checkout main
git pull
```

---

## 6. Environment Variable Problems

* Ensure `.env` exists in the service root.
* Check that all required variables are defined:

```bash
cat .env | grep <VARIABLE_NAME>
```

* Update `.env` if any variable is missing or incorrect.

---

## 7. Testing & Dev Tools

### 🔹 `pnpm test` fails

* Ensure services are running.
* Rebuild packages before testing:

```bash
pnpm build:packages
```

### 🔹 Debugging Database Data

* Use `pnpm db:studio` to inspect tables.
* Query with Prisma Client in `node` REPL:

```bash
pnpm tsx
> const { prisma } = require('./prismaClient')
> prisma.user.findMany()
```

---

## 8. Common Errors & Fixes Summary

| Error                        | Possible Cause                                  | Solution                                             |
| ---------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `Error: Port already in use` | Another process using the port                  | Kill process / change port in `.env`                 |
| `Prisma migration failed`    | DB schema mismatch                              | `pnpm db:reset` / drop DB manually                   |
| `Cannot find module`         | Missing dependencies                            | `pnpm install` / delete `node_modules`               |
| `Service crashes on start`   | Missing `.env` variable                         | Verify `.env` exists and has correct values          |
| `Build failed`               | Outdated lockfile / mismatched package versions | Delete `node_modules` + `pnpm-lock.yaml` and rebuild |

---

## 9. Debugging Tips

* Always check terminal logs for exact error messages.
* Verify `.env` and database configurations before changing code.
* Restart your terminal or IDE after changing environment variables.
* Use `pnpm db:studio` to inspect databases interactively.
* Keep `node`, `pnpm`, and PostgreSQL versions consistent with prerequisites.

---

> 💡 Pro Tip: Most beginner issues stem from missing dependencies, incorrect `.env` variables, or port conflicts. Always verify these first before deep debugging.

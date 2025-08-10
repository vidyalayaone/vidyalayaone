# 🐳 Docker Setup Guide for the Vidyalayaone Monorepo

## Prerequisites

* **Docker** v20.10.0 or higher
* **Docker Compose** v2.0.0 or higher
* **Git**

***

## Quick Start

### 1. Clone and Start
```bash
git clone git@github.com:only-exams/vidyalayaone.git
cd vidyalayaone
docker compose up --build
```

### 2. Access Your Services
* **Frontend**: http://localhost:8080
* **API Gateway**: http://localhost:3000
* **Auth Service**: http://localhost:3001
* **School Service**: http://localhost:3002

### 3. View Database (Prisma Studio)
**Auth Database:**
```bash
docker exec -it vidyalayaone-auth pnpm db:studio -- --hostname 0.0.0.0
```
Access at: **http://localhost:5556**

**School Database:**
```bash
docker exec -it vidyalayaone-school pnpm db:studio -- --hostname 0.0.0.0
```
Access at: **http://localhost:5557**

### 4. Stop Everything
```bash
# Stop services
docker compose down

# Stop and remove all data
docker compose down -v
```

***

## Essential Commands

| Action | Command |
|--------|---------|
| **Start Everything** | `docker compose up --build` |
| **Stop Everything** | `docker compose down` |
| **Clean Reset** | `docker compose down -v` |
| **View Logs** | `docker logs container_name -f` |
| **View All Logs** | `docker compose logs -f` |

***

## What Gets Set Up Automatically

✅ PostgreSQL databases (`auth_db` and `school_db`)  
✅ Database migrations for both services  
✅ All services (auth, school, api-gateway, frontend)  
✅ Network connectivity between containers  

**No manual database setup or dependency installation required!**

***

## Development Workflow

1. **Start**: `docker compose up --build`
2. **Code**: Make changes to your files (auto-reloads)
3. **Debug**: Check logs with `docker logs container_name -f`
4. **Database**: Use Prisma Studio (commands above)
5. **Stop**: `docker compose down`

***


📋 Complete Command Reference

## Container Management
```bash
# List all containers
docker ps

# Enter container shell
docker exec -it container_name sh

# Restart specific service
docker compose restart auth-service
```

## Viewing Logs
```bash
# Auth Service logs
docker logs vidyalayaone-auth -f

# School Service logs  
docker logs vidyalayaone-school -f

# API Gateway logs
docker logs vidyalayaone-gateway -f

# Frontend logs
docker logs vidyalayaone-frontend -f

# Database logs
docker logs vidyalayaone-db -f
```

## Database Access
```bash
# Connect to PostgreSQL directly
docker exec -it vidyalayaone-db psql -U postgres -d auth_db

# List all databases
docker exec -it vidyalayaone-db psql -U postgres -c "\l"
```

## Running Commands Inside Containers
```bash
# Install new dependencies in auth-service
docker exec -it vidyalayaone-auth pnpm install package-name

# Generate Prisma client
docker exec -it vidyalayaone-auth pnpm prisma generate

# Run migrations
docker exec -it vidyalayaone-auth pnpm db:migrate
```




🔧 Troubleshooting

### Container Won't Start
```bash
# Check container status
docker ps -a

# View container logs
docker logs container_name

# Rebuild specific service
docker compose build --no-cache service_name
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000

# Kill the process if needed
sudo kill -9 PID
```

### Database Connection Issues
```bash
# Check if database container is healthy
docker ps  # Look for "healthy" status

# Reset database (removes all data)
docker compose down -v
docker compose up --build
```

### Clean Everything
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything unused
docker system prune -a
```




🏗️ Service Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │
│   (Port 8080)   │───▶│   (Port 3000)   │
└─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌─────────────────┐    ┌─────────────────┐
        │  Auth Service   │    │ School Service  │
        │  (Port 3001)    │    │  (Port 3002)    │
        └─────────────────┘    └─────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │  (Port 5432)    │
                    │  - auth_db      │
                    │  - school_db    │
                    └─────────────────┘
```



***

## ✅ You're All Set

One command starts your entire development environment! 🚀🐳

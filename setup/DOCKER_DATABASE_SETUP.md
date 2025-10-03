# Database Setup Guide

## Prerequisites

Ensure you have **docker** installed

## 1. Start PostgreSQL Container (Docker)

Run the following command once to start the Postgres container:

```bash
docker run -d \
  --name vidyalayaone-postgres \
  --network vidyalayaone-net \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
````

---

## 2. Create Databases for Services

Inside the container, use the following scripts to create the databases you need:

```bash
docker exec -it vidyalayaone-postgres psql -U postgres -c "CREATE DATABASE auth;"
docker exec -it vidyalayaone-postgres psql -U postgres -c "CREATE DATABASE school;"
docker exec -it vidyalayaone-postgres psql -U postgres -c "CREATE DATABASE profile;"
docker exec -it vidyalayaone-postgres psql -U postgres -c "CREATE DATABASE attendance;"
docker exec -it vidyalayaone-postgres psql -U postgres -c "CREATE DATABASE payment;"
```

> 💡 Tip: Skip creating databases for services you are not working on.

---

## 3. Database Connection Strings

### a) If your backend apps are running in Docker:

```
auth_db       -> postgresql://postgres:postgres@vidyalayaone-postgres:5432/auth
school_db     -> postgresql://postgres:postgres@vidyalayaone-postgres:5432/school
profile_db    -> postgresql://postgres:postgres@vidyalayaone-postgres:5432/profile
attendance_db -> postgresql://postgres:postgres@vidyalayaone-postgres:5432/attendance
payment_db    -> postgresql://postgres:postgres@vidyalayaone-postgres:5432/payment
```

> ⚠️ Ensure all containers are on the same Docker network (`vidyalayaone-net`) as the database.

### b) If your backend apps are running on the host machine:

```
auth_db       -> postgresql://postgres:postgres@localhost:5432/auth
school_db     -> postgresql://postgres:postgres@localhost:5432/school
profile_db    -> postgresql://postgres:postgres@localhost:5432/profile
attendance_db -> postgresql://postgres:postgres@localhost:5432/attendance
payment_db    -> postgresql://postgres:postgres@localhost:5432/payment
```

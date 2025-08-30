docker compose exec auth-service sh -c "pnpm prisma migrate deploy"
docker compose exec school-service sh -c "pnpm prisma migrate deploy"
docker compose exec profile-service sh -c "pnpm prisma migrate deploy"
docker compose exec attendance-service sh -c "pnpm prisma migrate deploy"
git pull origin main
pnpm install
pnpm build
pnpm db:generate
node migrate-prod.js
node pm2.js
node seeding-prod.js
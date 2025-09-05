git pull origin main
pnpm install
pnpm build

backend -

pnpm db:generate
node migrate-prod.js
node pm2.js
node seeding-prod.js

platform-frontend -
cd apps/platform-frontend
pnpm build
cd ..
cd ..
cp -r apps/platform-frontend/dist/* /var/www/platform-frontend/
sudo nginx -t
sudo systemctl reload nginx
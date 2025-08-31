import { execSync } from 'child_process';

// Function to run migrations
function runMigrations() {
  const services = ['auth-service', 'school-service', 'profile-service', 'attendance-service'];
  
  console.log('🚀 Running database migrations...');
  
  for (const service of services) {
    console.log(`📦 Running migration for ${service}...`);
    
    try {
      execSync(`docker compose exec ${service} sh -c "pnpm prisma migrate deploy"`, { stdio: 'inherit' });
      console.log(`✅ Migration completed for ${service}`);
    } catch (error) {
      console.error(`❌ Migration failed for ${service}`);
      throw error;
    }
  }
  
  console.log('🎉 All migrations completed successfully!');
}

// Run migrations
try {
  runMigrations();
} catch (error) {
  console.error('❌ Migration process failed:', error.message);
  process.exit(1);
}

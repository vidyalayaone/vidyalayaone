import { execSync } from 'child_process';

// Function to run migrations
function runMigrations() {
  const services = ['auth-service', 'school-service', 'profile-service', 'attendance-service', 'payment-service', 'api-gateway'];
  
  console.log('🚀 Running pm2 for services...');
  
  for (const service of services) {
    console.log(`📦 Running pm2 for ${service}...`);
    
    try {
      execSync(`cd apps/${service} && pm2 start "pnpm start" --name ${service}`, { stdio: 'inherit' });
      console.log(`✅ pm2 completed for ${service}`);
    } catch (error) {
      console.error(`❌ pm2 failed for ${service}`);
      throw error;
    }
  }

  console.log('🎉 All services started successfully via pm2!');
}

// Run migrations
try {
  runMigrations();
} catch (error) {
  console.error('❌ pm2 process failed:', error.message);
  process.exit(1);
}
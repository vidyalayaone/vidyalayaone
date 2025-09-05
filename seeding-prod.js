import { execSync } from 'child_process';

// Function to run production seeding commands
function runProductionSeeding() {
  console.log('🌱 Running production database seeding...');
  
  // Step 1: Auth service - clean and seed
  console.log('📦 Cleaning and seeding auth-service...');
  try {
    execSync('docker compose exec auth-service sh -c "pnpm db:clean --yes && pnpm db:seed"', { stdio: 'inherit' });
    console.log('✅ Auth service seeding completed');
  } catch (error) {
    console.error('❌ Auth service seeding failed');
    throw error;
  }

  // Step 2: School service - clean only
  console.log('📦 Cleaning school-service...');
  try {
    execSync('docker compose exec school-service sh -c "pnpm db:clean --yes"', { stdio: 'inherit' });
    console.log('✅ School service cleaning completed');
  } catch (error) {
    console.error('❌ School service cleaning failed');
    throw error;
  }

  // Step 3: Profile service - clean only
  console.log('📦 Cleaning profile-service...');
  try {
    execSync('docker compose exec profile-service sh -c "pnpm db:clean --yes"', { stdio: 'inherit' });
    console.log('✅ Profile service cleaning completed');
  } catch (error) {
    console.error('❌ Profile service cleaning failed');
    throw error;
  }

  // Step 4: Production automation script
  console.log('📦 Running production automation script...');
  try {
    execSync('node production-automation.js', { stdio: 'inherit' });
    console.log('✅ Production automation completed');
  } catch (error) {
    console.error('❌ Production automation failed');
    throw error;
  }

  console.log('🎉 All production seeding completed successfully!');
}

// Run production seeding
try {
  runProductionSeeding();
} catch (error) {
  console.error('❌ Production seeding process failed:', error.message);
  process.exit(1);
}

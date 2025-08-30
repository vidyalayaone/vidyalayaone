import { execSync } from 'child_process';

// Function to run seeding commands
function runSeeding() {
  console.log('🌱 Running database seeding...');
  
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

  // Step 4: Frontend automation script
  console.log('📦 Running frontend automation script...');
  try {
    execSync('pnpm automate', { stdio: 'inherit', cwd: 'apps/school-frontend' });
    console.log('✅ Frontend automation completed');
  } catch (error) {
    console.error('❌ Frontend automation failed');
    throw error;
  }

  console.log('🎉 All seeding completed successfully!');
}

// Run seeding
try {
  runSeeding();
} catch (error) {
  console.error('❌ Seeding process failed:', error.message);
  process.exit(1);
}
import { PrismaClient, TenantStatus, TenantPlan } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding tenant database...');

  // Create sample tenants with proper enum values
  const tenants = [
    {
      slug: 'demo-school',
      name: 'Demo High School',
      domain: 'demo-school.onlyexams.com',
      status: TenantStatus.ACTIVE,      // Use enum value instead of string
      plan: TenantPlan.PREMIUM          // Use enum value instead of string
    },
    {
      slug: 'test-academy',
      name: 'Test Academy',
      domain: 'test-academy.onlyexams.com',
      status: TenantStatus.ACTIVE,      // Use enum value instead of string
      plan: TenantPlan.BASIC            // Use enum value instead of string
    },
    {
      slug: 'sample-college',
      name: 'Sample College',
      domain: 'sample-college.onlyexams.com',
      status: TenantStatus.TRIAL,       // Use enum value instead of string
      plan: TenantPlan.FREE             // Use enum value instead of string
    }
  ];

  for (const tenantData of tenants) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantData.slug },
      update: tenantData,
      create: tenantData,
    });
    console.log(`✅ Created/Updated tenant: ${tenant.name} (${tenant.slug})`);
  }

  console.log('🌱 Tenant database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Tenant seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

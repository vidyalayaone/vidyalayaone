import DatabaseService from '../src/services/database';

const { prisma } = DatabaseService;

async function main() {
  console.log('🚨 SCHOOL SERVICE - CLEANING DATABASE (DESTRUCTIVE)');

  if (!process.argv.includes('--yes')) {
    console.log('\nThis script will permanently remove ALL data from the school-service database.');
    console.log('If you are sure, re-run the command with the --yes flag.');
    process.exit(0);
  }

  try {
    // Discover existing tables in the public schema
    console.log('Discovering tables in the connected database...');
    const rows = (await prisma.$queryRawUnsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`)) as Array<{ tablename: string }>;
    const existing = rows.map(r => String(r.tablename));
    console.log('Found tables:', existing.join(', ') || '(none)');

    // Identify likely implicit join tables (Prisma M:N) that involve class and subject
    const joinTables = existing.filter(n => n.toLowerCase().includes('class') && n.toLowerCase().includes('subject'));
    if (joinTables.length) {
      console.log('Implicit join tables detected (will truncate first):', joinTables.join(', '));
      for (const jt of joinTables) {
        try {
          console.log(`Truncating join table "${jt}"...`);
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${jt}" RESTART IDENTITY CASCADE;`);
          console.log(`  ✅ Truncated join table: ${jt}`);
        } catch (err) {
          console.warn(`  ⚠️ Failed to truncate join table ${jt}:`, err && (err as any).message ? (err as any).message : String(err));
        }
      }
    } else {
      console.log('No implicit class<->subject join tables detected.');
    }

    // Now use Prisma client to delete model data in safe order (children first)
    // Note: use bracket access to avoid issues with reserved words like `class`.
    const ops: Array<{ name: string; fn: () => Promise<any> }> = [
      { name: 'sections', fn: () => (prisma as any).section.deleteMany() },
      { name: 'classes', fn: () => (prisma as any).class.deleteMany() },
      { name: 'subjects', fn: () => (prisma as any).subject.deleteMany() },
      { name: 'schools', fn: () => (prisma as any).school.deleteMany() }
    ];

    for (const op of ops) {
      try {
        console.log(`Deleting all ${op.name} via Prisma...`);
        await op.fn();
        console.log(`  ✅ Deleted all ${op.name}`);
      } catch (err) {
        console.warn(`  ⚠️ Skipping deleteMany for ${op.name}:`, err && (err as any).message ? (err as any).message : String(err));
      }
    }

    // As a final safety step, attempt to truncate any remaining detected tables related to this service
    const logicalTargets = ['classes', 'sections', 'subjects', 'schools'];
    const toTruncate = existing.filter(n => logicalTargets.some(t => n.toLowerCase().includes(t)));

    for (const name of toTruncate) {
      try {
        console.log(`Final truncate attempt for "${name}"...`);
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${name}" RESTART IDENTITY CASCADE;`);
        console.log(`  ✅ Truncated: ${name}`);
      } catch (err) {
        // not fatal
        console.warn(`  ⚠️ Could not truncate ${name}:`, err && (err as any).message ? (err as any).message : String(err));
      }
    }

    console.log('✅ Hybrid school service clean completed');
  } catch (err) {
    console.error('❌ Failed to clean school database:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('❌ Clean script failed:', e);
  process.exit(1);
});

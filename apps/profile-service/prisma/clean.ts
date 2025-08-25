import DatabaseService from '../src/services/database';

const { prisma } = DatabaseService;

async function main() {
  console.log('🚨 PROFILE SERVICE - CLEANING DATABASE (DESTRUCTIVE)');

  if (!process.argv.includes('--yes')) {
    console.log('\nThis script will permanently remove ALL data from the profile-service database.');
    console.log('If you are sure, re-run the command with the --yes flag.');
    process.exit(0);
  }

  try {
    // Discover existing tables
    console.log('Discovering tables in the connected database...');
    const rows = (await prisma.$queryRawUnsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`)) as Array<{ tablename: string }>;
    const existing = rows.map(r => String(r.tablename));
    console.log('Found tables:', existing.join(', ') || '(none)');

    // Truncate implicit join tables if present
    const joinTables = existing.filter(n => n.toLowerCase().includes('student') && n.toLowerCase().includes('guardian'));
    for (const jt of joinTables) {
      try {
        console.log(`Truncating join table "${jt}"...`);
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${jt}" RESTART IDENTITY CASCADE;`);
        console.log(`  ✅ Truncated join table: ${jt}`);
      } catch (err) {
        console.warn(`  ⚠️ Failed to truncate join table ${jt}:`, err && (err as any).message ? (err as any).message : String(err));
      }
    }

    // Use Prisma client to delete model data in safe order
    const ops: Array<{ name: string; fn: () => Promise<any> }> = [
      { name: 'student_guardians', fn: () => (prisma as any).studentGuardian.deleteMany() },
      { name: 'documents', fn: () => (prisma as any).document.deleteMany() },
      { name: 'student_enrollments', fn: () => (prisma as any).studentEnrollment.deleteMany() },
      { name: 'students', fn: () => (prisma as any).student.deleteMany() },
      { name: 'guardians', fn: () => (prisma as any).guardian.deleteMany() },
      { name: 'teachers', fn: () => (prisma as any).teacher.deleteMany() }
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

    // Final truncate attempts for any matching tables to reset identities
    const logicalTargets = ['student_guardians', 'documents', 'student_enrollments', 'students', 'guardians', 'teachers'];
    const toTruncate = existing.filter(n => logicalTargets.some(t => n.toLowerCase().includes(t)));

    for (const name of toTruncate) {
      try {
        console.log(`Final truncate attempt for "${name}"...`);
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${name}" RESTART IDENTITY CASCADE;`);
        console.log(`  ✅ Truncated: ${name}`);
      } catch (err) {
        console.warn(`  ⚠️ Could not truncate ${name}:`, err && (err as any).message ? (err as any).message : String(err));
      }
    }

    console.log('✅ Hybrid profile service clean completed');
  } catch (err) {
    console.error('❌ Failed to clean profile database:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('❌ Clean script failed:', e);
  process.exit(1);
});

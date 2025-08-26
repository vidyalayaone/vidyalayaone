import DatabaseService from '../src/services/database';

const { prisma } = DatabaseService;

async function cleanDatabase() {
  console.log('🧹 Starting attendance service database cleanup...');

  try {
    // Delete all records in the correct order (considering foreign key constraints)
    console.log('🗑️ Deleting student attendance records...');
    const deletedStudentAttendance = await prisma.studentAttendance.deleteMany({});
    console.log(`✅ Deleted ${deletedStudentAttendance.count} student attendance records`);

    console.log('🗑️ Deleting teacher attendance records...');
    const deletedTeacherAttendance = await prisma.teacherAttendance.deleteMany({});
    console.log(`✅ Deleted ${deletedTeacherAttendance.count} teacher attendance records`);

    console.log('✅ Attendance service database cleanup completed!');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

cleanDatabase()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

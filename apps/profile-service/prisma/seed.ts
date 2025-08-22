import DatabaseService from '../src/services/database';
import { Gender } from '../src/generated/client';
import * as readline from 'readline';

const { prisma } = DatabaseService;

// Sample student data
const studentsData = [
  {
    userId: '550e8400-e29b-41d4-a716-446655440001',
    admissionNumber: 'ADM001',
    firstName: 'Arjun',
    lastName: 'Sharma',
    bloodGroup: 'O+',
    category: 'General',
    religion: 'Hindu',
    gender: Gender.MALE,
    dateOfBirth: new Date('2010-03-15'),
    address: {
      street: '123 Gandhi Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    contactInfo: {
      primaryPhone: '9876543210',
      email: 'arjun.sharma@example.com',
      emergencyContact: '9876543211'
    },
    guardians: [
      {
        firstName: 'Rajesh',
        lastName: 'Sharma',
        phone: '9876543210',
        email: 'rajesh.sharma@example.com',
        relation: 'Father',
        address: {
          street: '123 Gandhi Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        }
      },
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        phone: '9876543212',
        email: 'priya.sharma@example.com',
        relation: 'Mother'
      }
    ],
    classId: '550e8400-e29b-41d4-a716-446655440010',
    sectionId: '550e8400-e29b-41d4-a716-446655440020',
    academicYear: '2025-26',
    rollNumber: '001'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440002',
    admissionNumber: 'ADM002',
    firstName: 'Ananya',
    lastName: 'Patel',
    bloodGroup: 'A+',
    category: 'General',
    religion: 'Hindu',
    gender: Gender.FEMALE,
    dateOfBirth: new Date('2010-07-22'),
    address: {
      street: '456 Nehru Road',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    contactInfo: {
      primaryPhone: '9876543213',
      email: 'ananya.patel@example.com',
      emergencyContact: '9876543214'
    },
    guardians: [
      {
        firstName: 'Vikram',
        lastName: 'Patel',
        phone: '9876543213',
        email: 'vikram.patel@example.com',
        relation: 'Father'
      },
      {
        firstName: 'Meera',
        lastName: 'Patel',
        phone: '9876543215',
        email: 'meera.patel@example.com',
        relation: 'Mother'
      }
    ],
    classId: '550e8400-e29b-41d4-a716-446655440010',
    sectionId: '550e8400-e29b-41d4-a716-446655440021',
    academicYear: '2025-26',
    rollNumber: '002'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440003',
    admissionNumber: 'ADM003',
    firstName: 'Mohammed',
    lastName: 'Ali',
    bloodGroup: 'B+',
    category: 'OBC',
    religion: 'Islam',
    gender: Gender.MALE,
    dateOfBirth: new Date('2010-11-10'),
    address: {
      street: '789 Akbar Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India'
    },
    contactInfo: {
      primaryPhone: '9876543216',
      email: 'mohammed.ali@example.com',
      emergencyContact: '9876543217'
    },
    guardians: [
      {
        firstName: 'Ahmed',
        lastName: 'Ali',
        phone: '9876543216',
        email: 'ahmed.ali@example.com',
        relation: 'Father'
      },
      {
        firstName: 'Fatima',
        lastName: 'Ali',
        phone: '9876543218',
        email: 'fatima.ali@example.com',
        relation: 'Mother'
      }
    ],
    classId: '550e8400-e29b-41d4-a716-446655440011',
    sectionId: '550e8400-e29b-41d4-a716-446655440020',
    academicYear: '2025-26',
    rollNumber: '003'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440004',
    admissionNumber: 'ADM004',
    firstName: 'Priya',
    lastName: 'Singh',
    bloodGroup: 'AB+',
    category: 'General',
    religion: 'Sikh',
    gender: Gender.FEMALE,
    dateOfBirth: new Date('2010-01-18'),
    address: {
      street: '321 Golden Temple Road',
      city: 'Amritsar',
      state: 'Punjab',
      pincode: '143001',
      country: 'India'
    },
    contactInfo: {
      primaryPhone: '9876543219',
      email: 'priya.singh@example.com',
      emergencyContact: '9876543220'
    },
    guardians: [
      {
        firstName: 'Harpreet',
        lastName: 'Singh',
        phone: '9876543219',
        email: 'harpreet.singh@example.com',
        relation: 'Father'
      },
      {
        firstName: 'Simran',
        lastName: 'Kaur',
        phone: '9876543221',
        email: 'simran.kaur@example.com',
        relation: 'Mother'
      }
    ],
    classId: '550e8400-e29b-41d4-a716-446655440011',
    sectionId: '550e8400-e29b-41d4-a716-446655440021',
    academicYear: '2025-26',
    rollNumber: '004'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440005',
    admissionNumber: 'ADM005',
    firstName: 'Karthik',
    lastName: 'Reddy',
    bloodGroup: 'O-',
    category: 'SC',
    religion: 'Hindu',
    gender: Gender.MALE,
    dateOfBirth: new Date('2010-09-05'),
    address: {
      street: '654 Temple Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    contactInfo: {
      primaryPhone: '9876543222',
      email: 'karthik.reddy@example.com',
      emergencyContact: '9876543223'
    },
    guardians: [
      {
        firstName: 'Ravi',
        lastName: 'Reddy',
        phone: '9876543222',
        email: 'ravi.reddy@example.com',
        relation: 'Father'
      }
    ],
    classId: '550e8400-e29b-41d4-a716-446655440012',
    sectionId: '550e8400-e29b-41d4-a716-446655440020',
    academicYear: '2025-26',
    rollNumber: '005'
  }
];

// Function to get school ID from user input
function getSchoolIdFromInput(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Please enter the School ID (UUID format): ', (schoolId) => {
      rl.close();
      resolve(schoolId.trim());
    });
  });
}

// Function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

async function createStudent(studentData: any, schoolId: string) {
  try {
    console.log(`📝 Creating student: ${studentData.firstName} ${studentData.lastName}`);
    
    // Check if student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { userId: studentData.userId }
    });

    if (existingStudent) {
      console.log(`⚠️  Student with userId ${studentData.userId} already exists. Skipping...`);
      return;
    }

    // Check if admission number already exists for the school
    const existingAdmissionNumber = await prisma.student.findUnique({
      where: {
        admissionNumber_schoolId: {
          admissionNumber: studentData.admissionNumber,
          schoolId: schoolId
        }
      }
    });

    if (existingAdmissionNumber) {
      console.log(`⚠️  Admission number ${studentData.admissionNumber} already exists for this school. Skipping...`);
      return;
    }

    // Create student with guardians and enrollment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create student
      const student = await tx.student.create({
        data: {
          userId: studentData.userId,
          admissionNumber: studentData.admissionNumber,
          schoolId: schoolId,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          bloodGroup: studentData.bloodGroup,
          category: studentData.category,
          religion: studentData.religion,
          admissionDate: new Date(),
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender,
          address: studentData.address,
          contactInfo: studentData.contactInfo,
        },
      });

      // Create guardians and link them to the student
      for (const guardianData of studentData.guardians) {
        // Create guardian
        const guardian = await tx.guardian.create({
          data: {
            firstName: guardianData.firstName,
            lastName: guardianData.lastName,
            phone: guardianData.phone,
            email: guardianData.email,
            address: guardianData.address,
          },
        });

        // Link guardian to student
        await tx.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: guardian.id,
            relation: guardianData.relation,
          },
        });
      }

      // Create enrollment
      const enrollment = await tx.studentEnrollment.create({
        data: {
          studentId: student.id,
          schoolId: schoolId,
          classId: studentData.classId,
          sectionId: studentData.sectionId,
          academicYear: studentData.academicYear,
          rollNumber: studentData.rollNumber,
          isCurrent: true,
        },
      });

      return { student, enrollment };
    });

    console.log(`✅ Successfully created student: ${studentData.firstName} ${studentData.lastName} (ID: ${result.student.id})`);
    
  } catch (error) {
    console.error(`❌ Error creating student ${studentData.firstName} ${studentData.lastName}:`, error);
  }
}

async function main() {
  console.log('🌱 Starting profile database seeding...');
  
  try {
    // Get school ID from user input
    const schoolId = await getSchoolIdFromInput();
    
    // Validate school ID format
    if (!isValidUUID(schoolId)) {
      console.error('❌ Invalid School ID format. Please provide a valid UUID.');
      process.exit(1);
    }

    console.log(`🏫 Using School ID: ${schoolId}`);
    console.log('📚 Creating students...\n');

    // Create all students
    for (const studentData of studentsData) {
      await createStudent(studentData, schoolId);
    }

    console.log('\n🌱 Profile database seeding completed!');
    console.log(`✅ Processed ${studentsData.length} students`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

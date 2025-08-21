import { SchoolLevel } from '../src/generated/client';
import DatabaseService from '../src/services/database';

const { prisma } = DatabaseService;

async function main() {
  console.log('🌱 Seeding school database...');

  // 1. Create a verified school
  console.log('📚 Creating school...');
  const school = await prisma.school.upsert({
    where: { subdomain: 'greenwood-academy' },
    update: {},
    create: {
      name: 'Greenwood Academy',
      subdomain: 'localhost',
      address: {
        address1: '123 Education Street',
        address2: 'Knowledge Block',
        locality: 'Academic Zone',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pinCode: '400001',
        landmark: 'Near Central Library'
      },
      level: SchoolLevel.mixed,
      board: 'CBSE',
      schoolCode: 'GWA001',
      isActive: true,
      phoneNumbers: ['+91-9876543210', '+91-9876543211'],
      email: 'admin@greenwoodacademy.edu.in',
      principalName: 'Dr. Rajesh Kumar',
      establishedYear: 1995,
      language: 'English',
      metaData: {
        website: 'https://greenwoodacademy.edu.in',
        affiliation: 'CBSE Board',
        totalStudents: 1200
      }
    }
  });
  console.log(`✅ Created school: ${school.name}`);

  // 2. Add classes from 1 to 12
  console.log('📖 Creating classes...');
  const classNames = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ];
  
  const academicYear = '2024-25';
  const createdClasses: { id: string; name: string; schoolId: string; academicYear: string }[] = [];

  for (const className of classNames) {
    const classRecord = await prisma.class.upsert({
      where: {
        schoolId_name_academicYear: {
          schoolId: school.id,
          name: className,
          academicYear
        }
      },
      update: {},
      create: {
        schoolId: school.id,
        name: className,
        academicYear,
        metaData: {
          capacity: className.includes('11') || className.includes('12') ? 60 : 40
        }
      },
      select: {
        id: true,
        name: true,
        schoolId: true,
        academicYear: true
      }
    });
    createdClasses.push(classRecord);
  }
  console.log(`✅ Created ${createdClasses.length} classes`);

  // 3. Add sections to classes
  console.log('📝 Creating sections...');
  const sectionData = [
    // Classes 1-5: Simple sections
    { className: 'Class 1', sections: ['default'] },
    { className: 'Class 2', sections: ['default'] },
    { className: 'Class 3', sections: ['A', 'B', 'C'] },
    { className: 'Class 4', sections: ['A', 'B', 'C'] },
    { className: 'Class 5', sections: ['A', 'B'] },
    
    // Classes 6-8: More sections
    { className: 'Class 6', sections: ['A', 'B', 'C'] },
    { className: 'Class 7', sections: ['A', 'B', 'C'] },
    { className: 'Class 8', sections: ['A', 'B', 'C', 'D'] },
    
    // Classes 9-10: Board exam preparation
    { className: 'Class 9', sections: ['A', 'B', 'C'] },
    { className: 'Class 10', sections: ['A', 'B', 'C'] },
    
    // Classes 11-12: Stream-based sections
    { className: 'Class 11', sections: ['Science-PCM', 'Science-PCB', 'Commerce', 'Arts'] },
    { className: 'Class 12', sections: ['Science-PCM', 'Science-PCB', 'Commerce', 'Arts'] }
  ];

  const classMap = new Map(createdClasses.map(c => [c.name, c.id]));

  for (const classSection of sectionData) {
    const classId = classMap.get(classSection.className);
    if (classId) {
      for (const sectionName of classSection.sections) {
        await prisma.section.upsert({
          where: {
            classId_name: {
              classId,
              name: sectionName
            }
          },
          update: {},
          create: {
            classId,
            name: sectionName,
            metaData: {
              capacity: sectionName.includes('Science') || sectionName.includes('Commerce') || sectionName.includes('Arts') ? 30 : 35
            }
          }
        });
      }
    }
  }
  console.log('✅ Created sections for all classes');

  // 4. Add common global subjects for classes 1-12
  console.log('📚 Creating global subjects...');
  const subjects = [
    // Core subjects for all classes
    { name: 'Mathematics', code: 'MATH', description: 'Mathematics and numerical analysis' },
    { name: 'English', code: 'ENG', description: 'English language and literature' },
    { name: 'Hindi', code: 'HIN', description: 'Hindi language and literature' },
    
    // Primary level subjects (1-5)
    { name: 'Environmental Studies', code: 'EVS', description: 'Environmental studies and general awareness' },
    { name: 'General Knowledge', code: 'GK', description: 'General knowledge and current affairs' },
    { name: 'Art and Craft', code: 'ART', description: 'Drawing, painting and craft work' },
    
    // Middle school subjects (6-8)
    { name: 'Science', code: 'SCI', description: 'General science covering physics, chemistry, and biology' },
    { name: 'Social Science', code: 'SST', description: 'History, geography, civics and economics' },
    { name: 'Sanskrit', code: 'SAN', description: 'Sanskrit language and literature' },
    
    // High school subjects (9-10)
    { name: 'Physics', code: 'PHY', description: 'Physics - mechanics, optics, electricity' },
    { name: 'Chemistry', code: 'CHEM', description: 'Chemistry - organic, inorganic, physical' },
    { name: 'Biology', code: 'BIO', description: 'Biology - botany, zoology, human physiology' },
    { name: 'History', code: 'HIST', description: 'World and Indian history' },
    { name: 'Geography', code: 'GEO', description: 'Physical and human geography' },
    { name: 'Political Science', code: 'POLS', description: 'Political science and civics' },
    { name: 'Economics', code: 'ECO', description: 'Microeconomics and macroeconomics' },
    
    // Senior secondary subjects (11-12)
    { name: 'Accountancy', code: 'ACC', description: 'Financial accounting and business studies' },
    { name: 'Business Studies', code: 'BST', description: 'Business management and entrepreneurship' },
    { name: 'Psychology', code: 'PSY', description: 'Human psychology and behavior' },
    { name: 'Sociology', code: 'SOC', description: 'Society, culture and social institutions' },
    { name: 'Philosophy', code: 'PHIL', description: 'Logic, ethics and metaphysics' },
    { name: 'Computer Science', code: 'CS', description: 'Programming, algorithms and computer applications' },
    
    // Additional subjects
    { name: 'Physical Education', code: 'PE', description: 'Physical fitness, sports and health education' },
    { name: 'Music', code: 'MUS', description: 'Vocal and instrumental music' },
    { name: 'Dance', code: 'DANCE', description: 'Classical and folk dance forms' }
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {
        code: subject.code,
        description: subject.description
      },
      create: {
        name: subject.name,
        code: subject.code,
        description: subject.description
      }
    });
  }
  console.log(`✅ Created ${subjects.length} global subjects`);

  // 5. Assign subjects to classes
  console.log('🎯 Assigning subjects to classes...');
  
  // Get all created subjects
  const allSubjects = await prisma.subject.findMany({
    select: { id: true, name: true }
  });
  const subjectMap = new Map(allSubjects.map(s => [s.name, s.id]));

  // Define subject assignments for each class
  const classSubjectAssignments = [
    // Classes 1-2: Basic subjects
    { 
      className: 'Class 1', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'Art and Craft', 'Physical Education'] 
    },
    { 
      className: 'Class 2', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'Art and Craft', 'Physical Education', 'General Knowledge'] 
    },
    
    // Classes 3-5: Extended primary
    { 
      className: 'Class 3', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'Art and Craft', 'Physical Education', 'General Knowledge', 'Music'] 
    },
    { 
      className: 'Class 4', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'Art and Craft', 'Physical Education', 'General Knowledge', 'Music'] 
    },
    { 
      className: 'Class 5', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'Art and Craft', 'Physical Education', 'General Knowledge', 'Computer Science'] 
    },
    
    // Classes 6-8: Middle school
    { 
      className: 'Class 6', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Science', 'Social Science', 'Sanskrit', 'Physical Education', 'Computer Science', 'Art and Craft'] 
    },
    { 
      className: 'Class 7', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Science', 'Social Science', 'Sanskrit', 'Physical Education', 'Computer Science'] 
    },
    { 
      className: 'Class 8', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Science', 'Social Science', 'Sanskrit', 'Physical Education', 'Computer Science'] 
    },
    
    // Classes 9-10: High school
    { 
      className: 'Class 9', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Political Science', 'Physical Education'] 
    },
    { 
      className: 'Class 10', 
      subjects: ['Mathematics', 'English', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Political Science', 'Physical Education'] 
    },
    
    // Classes 11-12: Senior secondary (comprehensive - students will choose streams)
    { 
      className: 'Class 11', 
      subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Political Science', 'Economics', 'Accountancy', 'Business Studies', 'Psychology', 'Computer Science', 'Physical Education'] 
    },
    { 
      className: 'Class 12', 
      subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Political Science', 'Economics', 'Accountancy', 'Business Studies', 'Psychology', 'Philosophy', 'Sociology', 'Computer Science', 'Physical Education'] 
    }
  ];

  for (const assignment of classSubjectAssignments) {
    const classId = classMap.get(assignment.className);
    if (classId) {
      const subjectIds = assignment.subjects
        .map(subjectName => subjectMap.get(subjectName))
        .filter(id => id !== undefined);

      await prisma.class.update({
        where: { id: classId },
        data: {
          subjects: {
            set: subjectIds.map(id => ({ id }))
          }
        }
      });
    }
  }
  console.log('✅ Assigned subjects to all classes');

  console.log('🌱 School database seeded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   🏫 School: ${school.name}`);
  console.log(`   📖 Classes: ${createdClasses.length} (Class 1-12)`);
  console.log(`   📝 Sections: Various sections including stream-based for Class 11-12`);
  console.log(`   📚 Subjects: ${subjects.length} global subjects`);
  console.log(`   🎯 Subject assignments: Complete mapping for all classes`);
}

main()
  .catch((e) => {
    console.error('❌ School seeding failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
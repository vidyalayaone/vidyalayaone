import DatabaseService from "../src/services/database";

const { prisma } = DatabaseService;

const COMMON_SUBJECTS = [
  // Primary Level Subjects
  { name: "English", code: "ENG", description: "English Language and Literature" },
  { name: "Hindi", code: "HIN", description: "Hindi Language and Literature" },
  { name: "Mathematics", code: "MATH", description: "Mathematical concepts and problem solving" },
  { name: "Science", code: "SCI", description: "General Science" },
  { name: "Social Studies", code: "SS", description: "Social Studies and History" },
  { name: "Environmental Studies", code: "EVS", description: "Environmental Science and Studies" },
  { name: "Computer Science", code: "CS", description: "Computer Science and Programming" },
  { name: "Art and Craft", code: "ART", description: "Art, Craft and Creative Activities" },
  { name: "Physical Education", code: "PE", description: "Physical Education and Sports" },
  { name: "Music", code: "MUS", description: "Music and Vocal Training" },
  
  // Secondary Level Subjects
  { name: "Physics", code: "PHY", description: "Physics - Study of matter and energy" },
  { name: "Chemistry", code: "CHEM", description: "Chemistry - Study of substances and reactions" },
  { name: "Biology", code: "BIO", description: "Biology - Study of living organisms" },
  { name: "Geography", code: "GEO", description: "Geography - Study of Earth and environment" },
  { name: "History", code: "HIST", description: "History - Study of past events" },
  { name: "Civics", code: "CIV", description: "Civics and Political Science" },
  { name: "Economics", code: "ECO", description: "Economics - Study of resources and markets" },
  
  // Language Subjects
  { name: "Sanskrit", code: "SAN", description: "Sanskrit Language" },
  { name: "French", code: "FR", description: "French Language" },
  { name: "German", code: "GER", description: "German Language" },
  { name: "Spanish", code: "SPA", description: "Spanish Language" },
  
  // Higher Secondary Subjects
  { name: "Accountancy", code: "ACC", description: "Accountancy and Financial Management" },
  { name: "Business Studies", code: "BS", description: "Business Studies and Management" },
  { name: "Psychology", code: "PSY", description: "Psychology - Study of mind and behavior" },
  { name: "Sociology", code: "SOC", description: "Sociology - Study of society" },
  { name: "Philosophy", code: "PHIL", description: "Philosophy - Study of fundamental questions" },
  { name: "Home Science", code: "HS", description: "Home Science and Nutrition" },
  { name: "Agriculture", code: "AGR", description: "Agriculture and Farming" },
  
  // Technical Subjects
  { name: "Information Technology", code: "IT", description: "Information Technology and Applications" },
  { name: "Engineering Drawing", code: "ED", description: "Engineering Drawing and Graphics" },
  { name: "Electronics", code: "ELEC", description: "Electronics and Communication" },
  { name: "Biotechnology", code: "BIOTECH", description: "Biotechnology and Applied Sciences" },
];

async function seedGlobalSubjects() {
  try {
    console.log('Starting to seed global subjects...');

    // Use upsert to create or update subjects
    const results = await Promise.all(
      COMMON_SUBJECTS.map(subject =>
        prisma.subject.upsert({
          where: { name: subject.name },
          update: {
            code: subject.code,
            description: subject.description,
            updatedAt: new Date()
          },
          create: {
            name: subject.name,
            code: subject.code,
            description: subject.description
          }
        })
      )
    );

    console.log(`Successfully seeded ${results.length} global subjects`);
    
    // Display the created subjects
    const allSubjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\nAll Global Subjects:');
    allSubjects.forEach(subject => {
      console.log(`- ${subject.name} (${subject.code}): ${subject.description}`);
    });

  } catch (error) {
    console.error('Error seeding global subjects:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedGlobalSubjects();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedGlobalSubjects };

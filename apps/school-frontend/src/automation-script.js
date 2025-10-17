#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const config = {
  baseURL: 'http://localhost:3000', // API Gateway URL
  host: 'vidyalayaone.com',
  users: {
    defaultUser: { username: 'first_user', password: 'password123' },
    platformAdmin: { username: 'abhijeetst22', password: 'avngr___stark' }
  }
};

// Common headers
const getHeaders = (token = null) => ({
  'Host': config.host,
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});

// Store tokens and important data
let tokens = {
  defaultUser: null,
  platformAdmin: null
};

let schoolData = {
  schoolId: null,
  classes: [],
  sections: [],
  subjects: []
};

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, token = null, extraHeaders = {}) {
  try {
    console.log(`\n🔄 Making ${method.toUpperCase()} request to: ${endpoint}`);
    
    const config_req = {
      method,
      url: `${config.baseURL}${endpoint}`,
      headers: { ...getHeaders(token), ...extraHeaders },
      ...(data && { data })
    };

    const response = await axios(config_req);
    console.log(`✅ Success: ${response.status} ${response.statusText}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: ${error.response?.status} ${error.response?.statusText}`);
    console.error(`Response: ${JSON.stringify(error.response?.data, null, 2)}`);
    throw error;
  }
}

// 1. Login with both accounts
async function loginUsers() {
  console.log('\n🔑 === STEP 1: LOGIN WITH BOTH ACCOUNTS ===');
  
  try {
    // Login with default user
    console.log('\n📱 Logging in first_user...');
    const defaultUserResponse = await makeRequest(
      'POST',
      '/api/v1/auth/login',
      config.users.defaultUser
    );
    tokens.defaultUser = defaultUserResponse.data.accessToken;
    console.log('✅ first_user logged in successfully');

    // Login with platform admin
    console.log('\n📱 Logging in abhijeetst22...');
    const adminResponse = await makeRequest(
      'POST',
      '/api/v1/auth/login',
      config.users.platformAdmin
    );
    tokens.platformAdmin = adminResponse.data.accessToken;
    console.log('✅ abhijeetst22 logged in successfully');

    console.log('\n🎉 Both users logged in successfully!');
  } catch (error) {
    console.error('❌ Failed to login users');
    throw error;
  }
}

// 2. Create a school
async function createSchool() {
  console.log('\n🏫 === STEP 2: CREATE SCHOOL ===');
  
  const schoolPayload = {
    name: "Sunshine Public School 2",
    subdomain: process.env.VITE_SUBDOMAIN || 'demo-school',
    address: {
      address1: "123 Education Street",
      address2: "Near City Center",
      locality: "Green Valley",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pinCode: "400001",
      landmark: "Next to City Park"
    },
    level: "mixed",
    board: "CBSE",
    schoolCode: "SPS003",
    phoneNumbers: ["+919876543210", "+918765432109"],
    email: "principal@sunshinesch.edu",
    principalName: "Dr. Rajesh Kumar",
    establishedYear: 1995,
    language: "English",
    metaData: {
      schoolType: "Co-educational",
      affiliationNumber: "12345",
      facilities: ["Library", "Laboratory", "Sports Ground", "Computer Lab"]
    }
  };

  try {
    const response = await makeRequest(
      'POST',
      '/api/v1/school/create',
      schoolPayload,
      tokens.defaultUser
    );
    
    schoolData.schoolId = response.data.school.id;
    console.log(`✅ School created successfully with ID: ${schoolData.schoolId}`);
    return response;
  } catch (error) {
    console.error('❌ Failed to create school');
    throw error;
  }
}

// 3. Seed common roles
async function seedRoles() {
  console.log('\n👥 === STEP 3: SEED COMMON ROLES ===');
  
  const rolesPayload = {
    schoolId: schoolData.schoolId,
    roles: [
      {
        name: "TEACHER",
        description: "Teacher role with permissions to manage classes and students",
        permissions: [
          "attendance.mark", "class.view"
        ]
      },
      {
        name: "STUDENT",
        description: "Student role with basic access permissions",
        permissions: [
        "me.view"
        ]
      }
    ]
  };

  try {
    const response = await makeRequest(
      'POST',
      '/api/v1/auth/seed-roles',
      rolesPayload,
      tokens.platformAdmin
    );
    
    console.log('✅ Roles seeded successfully');
    return response;
  } catch (error) {
    console.error('❌ Failed to seed roles');
    throw error;
  }
}

// 4. Create classes
async function createClasses() {
  console.log('\n📚 === STEP 4: CREATE CLASSES ===');
  
  const classesPayload = {
    schoolId: schoolData.schoolId,
    classes: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"],
    academicYear: "2025-26"
  };

  try {
    const response = await makeRequest(
      'POST',
      '/api/v1/school/classes',
      classesPayload,
      tokens.platformAdmin
    );
    
    schoolData.classes = response.data.classes;
    console.log(`✅ ${schoolData.classes.length} classes created successfully`);
    console.log('Classes:', schoolData.classes.map(c => c.name).join(', '));
    return response;
  } catch (error) {
    console.error('❌ Failed to create classes');
    throw error;
  }
}

// 5. Create sections
async function createSections() {
  console.log('\n🏛️ === STEP 5: CREATE SECTIONS ===');
  
  // Function to randomly determine section names for a class
  const getRandomSections = () => {
    const sectionTypes = [
      ["Default"], // Type 1: default only
      ["A", "B"],  // Type 2: A, B
      ["A", "B", "C"] // Type 3: A, B, C
    ];
    
    // Randomly pick one of the three types
    const randomType = Math.floor(Math.random() * 3);
    return sectionTypes[randomType];
  };
  
  const sectionsPayload = {
    schoolId: schoolData.schoolId,
    academicYear: "2025-26",
    sections: schoolData.classes.map(classItem => {
      const sectionNames = getRandomSections();
      console.log(`📝 Class ${classItem.name} will have sections: ${sectionNames.join(', ')}`);
      return {
        className: classItem.name,
        sectionNames: sectionNames
      };
    })
  };

  try {
    const response = await makeRequest(
      'POST',
      '/api/v1/school/sections',
      sectionsPayload,
      tokens.platformAdmin
    );
    
    schoolData.sections = response.data.sections;
    console.log(`✅ ${schoolData.sections.length} sections created successfully`);
    return response;
  } catch (error) {
    console.error('❌ Failed to create sections');
    throw error;
  }
}

// 6. Create global subjects
async function createGlobalSubjects() {
  console.log('\n📖 === STEP 6: CREATE GLOBAL SUBJECTS ===');
  
  const globalSubjectsPayload = {
    subjects: [
      { name: "Mathematics", code: "MATH", description: "Mathematics and numerical skills" },
      { name: "English", code: "ENG", description: "English language and literature" },
      { name: "Hindi", code: "HIN", description: "Hindi language" },
      { name: "Science", code: "SCI", description: "General Science" },
      { name: "Social Studies", code: "SST", description: "Social Studies and History" },
      { name: "Computer Science", code: "CS", description: "Computer Science and Programming" },
      { name: "Physical Education", code: "PE", description: "Physical Education and Sports" },
      { name: "Art and Craft", code: "ART", description: "Art and Creative Activities" },
      { name: "Music", code: "MUS", description: "Music and Performing Arts" },
      { name: "Sanskrit", code: "SANS", description: "Sanskrit language" }
    ]
  };

  try {
    const response = await makeRequest(
      'POST',
      '/api/v1/school/subjects/global',
      globalSubjectsPayload,
      tokens.platformAdmin
    );
    
    schoolData.subjects = response.data.subjects;
    console.log(`✅ ${schoolData.subjects.length} global subjects created successfully`);
    console.log('Subjects:', schoolData.subjects.map(s => s.name).join(', '));
    return response;
  } catch (error) {
    console.error('❌ Failed to create global subjects');
    throw error;
  }
}

// 7. Assign subjects to classes
async function assignSubjectsToClasses() {
  console.log('\n🎯 === STEP 7: ASSIGN SUBJECTS TO CLASSES ===');
  
  // Define subject assignments based on grade level
  const getSubjectsForClass = (className) => {
    const lowerGrades = ["1st", "2nd", "3rd"];
    const middleGrades = ["4th", "5th", "6th", "7th"];
    const higherGrades = ["8th", "9th", "10th"];

    if (lowerGrades.includes(className)) {
      return ["Mathematics", "English", "Hindi", "Science", "Art and Craft", "Physical Education"];
    } else if (middleGrades.includes(className)) {
      return ["Mathematics", "English", "Hindi", "Science", "Social Studies", "Computer Science", "Physical Education", "Art and Craft"];
    } else if (higherGrades.includes(className)) {
      return ["Mathematics", "English", "Hindi", "Science", "Social Studies", "Computer Science", "Physical Education", "Sanskrit"];
    }
    return [];
  };

  const classSubjectsPayload = {
    schoolId: schoolData.schoolId,
    academicYear: "2025-26",
    classSubjects: schoolData.classes.map(classItem => ({
      className: classItem.name,
      subjectNames: getSubjectsForClass(classItem.name)
    }))
  };

  try {
    const response = await makeRequest(
      'POST',
      '/api/v1/school/subjects',
      classSubjectsPayload,
      tokens.platformAdmin
    );
    
    console.log('✅ Subjects assigned to classes successfully');
    return response;
  } catch (error) {
    console.error('❌ Failed to assign subjects to classes');
    throw error;
  }
}

// 8. Approve the school
async function approveSchool() {
  console.log('\n✅ === STEP 8: APPROVE SCHOOL ===');
  
  try {
    const response = await makeRequest(
      'GET',
      `/api/v1/school/approve/${schoolData.schoolId}`,
      null,
      tokens.platformAdmin
    );
    
    console.log('✅ School approved successfully');
    return response;
  } catch (error) {
    console.error('❌ Failed to approve school');
    throw error;
  }
}

// 9. Create teachers
async function createTeachers() {
  console.log('\n👩‍🏫 === STEP 9: CREATE TEACHERS ===');

  if (!schoolData.subjects || schoolData.subjects.length === 0) {
    console.warn('No subjects found to assign to teachers');
    return;
  }

  const firstNames = ['Amit','Riya','Karan','Sneha','Vikram','Anita','Rahul','Meera','Sonal','Deepak'];
  const lastNames = ['Sharma','Patel','Singh','Khan','Iyer','Desai','Gupta','Nair','Rao','Verma'];

  const subjectIds = schoolData.subjects.map(s => s.id).filter(Boolean);
  const teacherCount = 8;
  const createdTeachers = [];

  function pickRandom(arr, n=1){
    const copy = [...arr];
    const out = [];
    n = Math.min(n, arr.length);
    for(let i=0;i<n;i++){
      const idx = Math.floor(Math.random()*copy.length);
      out.push(copy.splice(idx,1)[0]);
    }
    return out;
  }

  for (let i=0;i<teacherCount;i++){
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[(i+3) % lastNames.length];
    const employeeId = `EMP${String(i+1).padStart(3,'0')}`;
    const assignedSubjects = pickRandom(subjectIds, Math.floor(Math.random()*2)+1); // 1-2 subjects

    const teacherPayload = {
      firstName,
      lastName,
      employeeId,
      gender: (i % 2 === 0) ? 'MALE' : 'FEMALE',
      dateOfBirth: new Date(1985 + (i % 10), 0, 15).toISOString(),
      qualifications: 'B.Ed, M.Sc',
      joiningDate: new Date().toISOString(),
      salary: 30000 + (i * 1000),
      address: {
        street: 'School Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      phoneNumber: `98765${String(43210 + i).slice(-5)}`, // Generate unique 10-digit phone numbers
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@vidyalayaone.com`,
      subjectIds: assignedSubjects
    };

    try {
      const res = await makeRequest(
        'POST',
        '/api/v1/profile/teachers',
        teacherPayload,
        tokens.platformAdmin,
        { 'x-context': 'school', 'x-subdomain': process.env.VITE_SUBDOMAIN  }
      );
      createdTeachers.push(res.data.teacher || res.data);
      console.log(`✅ Created teacher ${firstName} ${lastName} (employeeId=${employeeId})`);
    } catch (err) {
      console.warn('Could not create teacher', employeeId, err.message || err);
    }
  }

  console.log(`✅ Created ${createdTeachers.length} teachers`);
  return createdTeachers;
}

// 10. Create students
async function createStudents() {
  console.log('\n🧑‍🎓 === STEP 10: CREATE STUDENTS ===');

  if (!schoolData.classes || schoolData.classes.length === 0 || !schoolData.sections || schoolData.sections.length === 0) {
    console.warn('No classes/sections found to enroll students');
    return;
  }

  const firstNames = ['Aarav','Isha','Kabir','Nia','Rohan','Tara','Arjun','Diya','Kabir','Lina','Samir','Ria','Vanya','Neel','Anaya'];
  const lastNames = ['Shah','Malhotra','Bose','Chopra','Agarwal','Bhatt','Joshi','Mehta','Kapoor','Saxena'];

  // Build class->sections map
  const classSectionsMap = {};
  for (const sec of schoolData.sections) {
    if (!classSectionsMap[sec.classId]) classSectionsMap[sec.classId] = [];
    classSectionsMap[sec.classId].push(sec);
  }

  const studentsToCreate = 12;
  const createdStudents = [];

  for (let i=0;i<studentsToCreate;i++){
    // pick a random class that has sections
    const classWithSections = Object.keys(classSectionsMap).filter(k => classSectionsMap[k].length>0);
    const classId = classWithSections[Math.floor(Math.random()*classWithSections.length)];
    const section = classSectionsMap[classId][Math.floor(Math.random()*classSectionsMap[classId].length)];

    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const admissionNumber = `ADM${Date.now().toString().slice(-6)}${i}`;

    const phone = String(9000000000 + Math.floor(Math.random()*899999999)); // 10 digits
    const studentPayload = {
      firstName,
      lastName,
      admissionNumber,
      admissionDate: new Date().toISOString(),
      dateOfBirth: new Date(2010 + (i % 8), 0, 1).toISOString(),
      gender: (i % 2 === 0) ? 'MALE' : 'FEMALE',
      address: {
        street: 'Home Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      contactInfo: {
        primaryPhone: phone,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
      },
      parentInfo: {
        fatherName: `Mr ${lastName}`,
        fatherPhone: phone,
        motherName: `Mrs ${lastName}`,
        motherPhone: phone
      },
      classId: classId,
      sectionId: section.id,
      academicYear: '2025-26',
      rollNumber: String(i+1)
    };

    try {
              // console.log(schoolData.subdomain);

      const res = await makeRequest(
        'POST',
        '/api/v1/profile/students',
        studentPayload,
        tokens.platformAdmin,
        { 'x-context': 'school', 'x-subdomain': process.env.VITE_SUBDOMAIN }
        // { 'Host': 'localhost.vidyalayaone.com', 'x-context': 'school', 'x-school-id': schoolData.schoolId }
      );
      createdStudents.push(res.data.student || res.data);
      console.log(`✅ Created student ${firstName} ${lastName} (admission=${admissionNumber})`);
    } catch (err) {
      console.warn('Could not create student', admissionNumber, err.message || err);
    }
  }

  console.log(`✅ Created ${createdStudents.length} students`);
  return createdStudents;
}

// Main function to run all steps
async function runAutomation() {
  console.log('🚀 === VIDYALAYAONE BACKEND AUTOMATION SCRIPT ===');
  console.log(`🌐 Base URL: ${config.baseURL}`);
  console.log(`🏠 Host Header: ${config.host}`);
  console.log('============================================\n');

  try {
    // Step 1: Login
    await loginUsers();
    
    // Step 2: Create School
    await createSchool();
    
    // Step 3: Seed Roles
    await seedRoles();
    
    // Step 4: Create Classes
    await createClasses();
    
    // Step 5: Create Sections
    await createSections();
    
    // Step 6: Create Global Subjects
    await createGlobalSubjects();
    
    // Step 7: Assign Subjects to Classes
    await assignSubjectsToClasses();
    
    // Step 8: Approve School
    await approveSchool();
    
    // Step 9: Create Teachers
    await createTeachers();
    
    // Step 10: Create Students
    await createStudents();
    
    console.log('\n🎉 === AUTOMATION COMPLETED SUCCESSFULLY! ===');
    console.log('\n📊 Summary:');
    console.log(`🏫 School ID: ${schoolData.schoolId}`);
    console.log(`📚 Classes Created: ${schoolData.classes.length}`);
    console.log(`🏛️ Sections Created: ${schoolData.sections.length}`);
    console.log(`📖 Global Subjects Created: ${schoolData.subjects.length}`);
    console.log('✅ School Approved: Yes');
    console.log('\n🔧 All backend routes tested successfully!');
    
  } catch (error) {
    console.error('\n💥 === AUTOMATION FAILED ===');
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Handle script execution
// Cross-platform solution for detecting if this is the main module
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform check for main module
const isMainModule = process.argv[1] && (
  path.resolve(__filename) === path.resolve(process.argv[1]) ||
  __filename === process.argv[1] ||
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`
);

if (isMainModule) {
  console.log('Starting automation script...');
  runAutomation().catch(error => {
    console.error('Automation failed:', error);
    process.exit(1);
  });
}

export {
  runAutomation,
  config,
  tokens,
  schoolData
};

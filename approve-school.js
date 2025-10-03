#!/usr/bin/env node

import axios from 'axios';
import readline from 'readline';

// Configuration
const config = {
  baseURL: 'https://vidyalayaone.com/api/v1', // API Gateway URL
  host: 'vidyalayaone.com',
  users: {
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
  platformAdmin: null
};

let schoolData = {
  schoolId: null
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

// Function to get school ID from user input
function getSchoolIdFromInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Please enter the School ID: ', (schoolId) => {
      rl.close();
      resolve(schoolId.trim());
    });
  });
}

// 1. Login with platform admin
async function loginPlatformAdmin() {
  console.log('\n🔑 === STEP 1: LOGIN WITH PLATFORM ADMIN ===');
  
  try {
    console.log('\n📱 Logging in abhijeetst22...');
    const adminResponse = await makeRequest(
      'POST',
      '/auth/login',
      config.users.platformAdmin
    );
    tokens.platformAdmin = adminResponse.data.accessToken;
    console.log('✅ abhijeetst22 logged in successfully');

    console.log('\n🎉 Platform admin logged in successfully!');
  } catch (error) {
    console.error('❌ Failed to login platform admin');
    throw error;
  }
}

// 2. Seed roles for the given school
async function seedRoles() {
  console.log('\n👥 === STEP 2: SEED ROLES FOR SCHOOL ===');
  
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
      '/auth/seed-roles',
      rolesPayload,
      tokens.platformAdmin
    );
    
    console.log('✅ Roles seeded successfully for school');
    return response;
  } catch (error) {
    console.error('❌ Failed to seed roles');
    throw error;
  }
}

// 3. Approve the school
async function approveSchool() {
  console.log('\n✅ === STEP 3: APPROVE SCHOOL ===');
  
  try {
    const response = await makeRequest(
      'GET',
      `/school/approve/${schoolData.schoolId}`,
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

// Main function to run all steps
async function runSchoolApproval() {
  console.log('🚀 === VIDYALAYAONE SCHOOL APPROVAL SCRIPT ===');
  console.log(`🌐 Base URL: ${config.baseURL}`);
  console.log(`🏠 Host Header: ${config.host}`);
  console.log('============================================\n');

  try {
    // Get school ID from user input
    schoolData.schoolId = await getSchoolIdFromInput();
    console.log(`🏫 Using School ID: ${schoolData.schoolId}`);
    
    // Step 1: Login
    await loginPlatformAdmin();
    
    // Step 2: Seed Roles
    await seedRoles();
    
    // Step 3: Approve School
    await approveSchool();
    
    console.log('\n🎉 === SCHOOL APPROVAL COMPLETED SUCCESSFULLY! ===');
    console.log('\n📊 Summary:');
    console.log(`🏫 School ID: ${schoolData.schoolId}`);
    console.log('✅ School Approved: Yes');
    console.log('👥 Roles Seeded: Yes');
    console.log('\n🔧 School approval process completed successfully!');
    
  } catch (error) {
    console.error('\n💥 === SCHOOL APPROVAL FAILED ===');
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
  console.log('Starting school approval script...');
  runSchoolApproval().catch(error => {
    console.error('School approval failed:', error);
    process.exit(1);
  });
}

export {
  runSchoolApproval,
  config,
  tokens,
  schoolData
};

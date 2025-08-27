const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3000'; // API Gateway
const TEST_SCHOOL_ID = '01936e42-d1d4-7e89-8b45-5a65dcd4c123'; // Replace with actual school ID
const TEST_CLASS_ID = '01936e50-1df9-72ae-9442-fe98c4d0b56a'; // Replace with actual class ID  
const TEST_SECTION_ID = '01936e50-4af1-76fb-a9c6-6eb5b4e9e6f1'; // Replace with actual section ID

// Mock auth token (replace with actual token for testing)
const AUTH_TOKEN = 'Bearer your-test-token-here';

async function testSectionEndpoints() {
  console.log('🧪 Testing Section API Endpoints...\n');

  // Test 1: Get Section Details
  try {
    console.log('📋 Testing GET Section Details...');
    const detailsResponse = await axios.get(
      `${API_BASE_URL}/api/v1/school/${TEST_SCHOOL_ID}/classes/${TEST_CLASS_ID}/sections/${TEST_SECTION_ID}/details`,
      {
        headers: {
          'Authorization': AUTH_TOKEN,
          'x-context': 'school',
          'x-school-id': TEST_SCHOOL_ID
        }
      }
    );
    
    console.log('✅ Section Details Response:', JSON.stringify(detailsResponse.data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Section Details Error:', error.response?.data || error.message);
    console.log('');
  }

  // Test 2: Get Section Students
  try {
    console.log('👥 Testing GET Section Students...');
    const studentsResponse = await axios.get(
      `${API_BASE_URL}/api/v1/school/${TEST_SCHOOL_ID}/classes/${TEST_CLASS_ID}/sections/${TEST_SECTION_ID}/students`,
      {
        headers: {
          'Authorization': AUTH_TOKEN,
          'x-context': 'school',
          'x-school-id': TEST_SCHOOL_ID
        }
      }
    );
    
    console.log('✅ Section Students Response:', JSON.stringify(studentsResponse.data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Section Students Error:', error.response?.data || error.message);
    console.log('');
  }

  // Test 3: Get Section Timetable
  try {
    console.log('📅 Testing GET Section Timetable...');
    const timetableResponse = await axios.get(
      `${API_BASE_URL}/api/v1/school/${TEST_SCHOOL_ID}/classes/${TEST_CLASS_ID}/sections/${TEST_SECTION_ID}/timetable`,
      {
        headers: {
          'Authorization': AUTH_TOKEN,
          'x-context': 'school',
          'x-school-id': TEST_SCHOOL_ID
        }
      }
    );
    
    console.log('✅ Section Timetable Response:', JSON.stringify(timetableResponse.data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Section Timetable Error:', error.response?.data || error.message);
    console.log('');
  }
}

// Test Profile Service Students directly
async function testProfileServiceStudents() {
  console.log('👤 Testing Profile Service Students API...\n');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/profile/schools/students`,
      {
        params: {
          classId: TEST_CLASS_ID,
          sectionId: TEST_SECTION_ID
        },
        headers: {
          'Authorization': AUTH_TOKEN,
          'x-context': 'school',
          'x-school-id': TEST_SCHOOL_ID
        }
      }
    );
    
    console.log('✅ Profile Service Students Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Profile Service Students Error:', error.response?.data || error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting API Connectivity Tests...\n');
  
  await testSectionEndpoints();
  await testProfileServiceStudents();
  
  console.log('🏁 Tests completed!');
}

runAllTests();

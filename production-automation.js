#!/usr/bin/env node

import axios from 'axios';

// Configuration
const config = {
  baseURL: 'http://localhost:3000', // API Gateway URL
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

// 1. Login with platform admin
async function loginPlatformAdmin() {
  console.log('\n🔑 === STEP 1: LOGIN WITH PLATFORM ADMIN ===');
  
  try {
    console.log('\n📱 Logging in abhijeetst22...');
    const adminResponse = await makeRequest(
      'POST',
      '/api/v1/auth/login',
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

// 2. Create global subjects for Indian curriculum (Nursery to 12th)
async function createGlobalSubjects() {
  console.log('\n📖 === STEP 2: CREATE GLOBAL SUBJECTS ===');
  
  const globalSubjectsPayload = {
    subjects: [
      // Core subjects for all grades
      { name: "Mathematics", code: "MATH", description: "Mathematics and numerical skills" },
      { name: "English", code: "ENG", description: "English language and literature" },
      { name: "Hindi", code: "HIN", description: "Hindi language" },
      { name: "Science", code: "SCI", description: "General Science" },
      { name: "Social Studies", code: "SST", description: "Social Studies and History" },
      
      // Pre-primary subjects (Nursery, LKG, UKG)
      { name: "Phonics", code: "PHON", description: "Phonics and basic reading skills" },
      { name: "Rhymes and Stories", code: "RHYME", description: "Nursery rhymes and story telling" },
      { name: "Number Work", code: "NUM", description: "Basic number recognition and counting" },
      { name: "Drawing and Coloring", code: "DRAW", description: "Creative drawing and coloring activities" },
      { name: "General Knowledge", code: "GK", description: "Basic general knowledge and awareness" },
      
      // Primary subjects (1st to 5th)
      { name: "Environmental Studies", code: "EVS", description: "Environmental Studies (for primary classes)" },
      { name: "Moral Science", code: "MS", description: "Moral and value education" },
      { name: "Computer Science", code: "CS", description: "Basic computer literacy and programming" },
      { name: "Art and Craft", code: "ART", description: "Art and creative activities" },
      { name: "Physical Education", code: "PE", description: "Physical education and sports" },
      { name: "Music", code: "MUS", description: "Music and vocal training" },
      { name: "Dance", code: "DANCE", description: "Classical and folk dance" },
      
      // Secondary subjects (6th to 10th)
      { name: "Geography", code: "GEO", description: "Geography and earth sciences" },
      { name: "History", code: "HIST", description: "History and civilization" },
      { name: "Civics", code: "CIV", description: "Civics and government studies" },
      { name: "Sanskrit", code: "SANS", description: "Sanskrit language and literature" },
      { name: "Physics", code: "PHY", description: "Physics and physical sciences" },
      { name: "Chemistry", code: "CHEM", description: "Chemistry and chemical sciences" },
      { name: "Biology", code: "BIO", description: "Biology and life sciences" },
      
      // Higher secondary subjects (11th and 12th)
      { name: "Economics", code: "ECO", description: "Economics and business studies" },
      { name: "Political Science", code: "POL", description: "Political science and governance" },
      { name: "Psychology", code: "PSY", description: "Psychology and human behavior" },
      { name: "Sociology", code: "SOC", description: "Sociology and social studies" },
      { name: "Philosophy", code: "PHIL", description: "Philosophy and ethics" },
      { name: "Accountancy", code: "ACC", description: "Accountancy and financial management" },
      { name: "Business Studies", code: "BS", description: "Business studies and entrepreneurship" },
      { name: "Informatics Practices", code: "IP", description: "Advanced computer applications" },
      { name: "Biotechnology", code: "BIOTECH", description: "Biotechnology and applied biology" },
      { name: "Home Science", code: "HS", description: "Home science and family studies" },
      
      // Language subjects
      { name: "Marathi", code: "MAR", description: "Marathi language (regional)" },
      { name: "Tamil", code: "TAM", description: "Tamil language (regional)" },
      { name: "Telugu", code: "TEL", description: "Telugu language (regional)" },
      { name: "Kannada", code: "KAN", description: "Kannada language (regional)" },
      { name: "Malayalam", code: "MAL", description: "Malayalam language (regional)" },
      { name: "Bengali", code: "BEN", description: "Bengali language (regional)" },
      { name: "Gujarati", code: "GUJ", description: "Gujarati language (regional)" },
      { name: "Punjabi", code: "PUN", description: "Punjabi language (regional)" },
      { name: "Urdu", code: "URD", description: "Urdu language" },
      { name: "French", code: "FR", description: "French language (foreign)" },
      { name: "German", code: "GER", description: "German language (foreign)" },
      { name: "Spanish", code: "SPA", description: "Spanish language (foreign)" },
      
      // Vocational and skill subjects
      { name: "Engineering Graphics", code: "EG", description: "Technical drawing and graphics" },
      { name: "Agriculture", code: "AGR", description: "Agriculture and farming" },
      { name: "Fashion Designing", code: "FD", description: "Fashion and textile design" },
      { name: "Mass Media", code: "MM", description: "Mass media and communication" },
      { name: "Travel and Tourism", code: "TT", description: "Travel, tourism and hospitality" },
      { name: "Retail", code: "RET", description: "Retail management and sales" },
      { name: "Security", code: "SEC", description: "Security services and management" },
      { name: "Automobile", code: "AUTO", description: "Automobile technology and maintenance" },
      { name: "Beauty and Wellness", code: "BW", description: "Beauty therapy and wellness" },
      { name: "Healthcare", code: "HC", description: "Healthcare and nursing" },
      { name: "IT Applications", code: "ITA", description: "Information technology applications" },
      
      // Special subjects
      { name: "Yoga", code: "YOGA", description: "Yoga and meditation" },
      { name: "Life Skills", code: "LS", description: "Life skills and personality development" },
      { name: "Career Guidance", code: "CG", description: "Career counseling and guidance" },
      { name: "Financial Literacy", code: "FL", description: "Financial planning and literacy" }
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
    console.log('Subjects created:', schoolData.subjects.map(s => s.name).join(', '));
    return response;
  } catch (error) {
    console.error('❌ Failed to create global subjects');
    throw error;
  }
}

// Main function to run all steps
async function runProductionAutomation() {
  console.log('🚀 === VIDYALAYAONE PRODUCTION AUTOMATION SCRIPT ===');
  console.log(`🌐 Base URL: ${config.baseURL}`);
  console.log(`🏠 Host Header: ${config.host}`);
  console.log('============================================\n');

  try {
    // Step 1: Login
    await loginPlatformAdmin();
    
    // Step 2: Create Global Subjects
    await createGlobalSubjects();
    
    console.log('\n🎉 === PRODUCTION AUTOMATION COMPLETED SUCCESSFULLY! ===');
    console.log('\n📊 Summary:');
    console.log(`📖 Global Subjects Created: ${schoolData.subjects.length}`);
    console.log('\n🔧 Global subjects created successfully!');
    
  } catch (error) {
    console.error('\n💥 === PRODUCTION AUTOMATION FAILED ===');
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
  console.log('Starting production automation script...');
  runProductionAutomation().catch(error => {
    console.error('Production automation failed:', error);
    process.exit(1);
  });
}

export {
  runProductionAutomation,
  config,
  tokens,
  schoolData
};

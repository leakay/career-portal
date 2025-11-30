const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test functions
async function testHealthCheck() {
  try {
    console.log('🧪 Testing Health Check...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data.message);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
}

async function testGetAllApplications() {
  try {
    console.log('\n🧪 Testing Get All Applications...');
    const response = await axios.get(`${BASE_URL}/applications`);
    console.log('✅ Get All Applications:', response.data.message);
    console.log('📊 Total Applications:', response.data.count);
    console.log('📝 Applications:', response.data.data.map(app => ({
      id: app.id,
      student: app.studentName,
      university: app.institution,
      course: app.course,
      status: app.status
    })));
  } catch (error) {
    console.log('❌ Get All Applications Failed:', error.message);
  }
}

async function testGetApplicationsWithFilters() {
  try {
    console.log('\n🧪 Testing Get Applications with Filters...');
    
    // Test status filter
    const statusResponse = await axios.get(`${BASE_URL}/applications?status=Initial Parties`);
    console.log('✅ Status Filter - Initial Parties:', statusResponse.data.count, 'applications');
    
    // Test institution filter
    const instResponse = await axios.get(`${BASE_URL}/applications?institution=National University of Lesotho`);
    console.log('✅ Institution Filter - NUL:', instResponse.data.count, 'applications');
    
  } catch (error) {
    console.log('❌ Filter Test Failed:', error.message);
  }
}

async function testGetApplicationById() {
  try {
    console.log('\n🧪 Testing Get Application by ID...');
    const response = await axios.get(`${BASE_URL}/applications/1`);
    console.log('✅ Get Application by ID:', response.data.data.studentName);
    console.log('📋 Application Details:', {
      university: response.data.data.institution,
      course: response.data.data.course,
      status: response.data.data.status,
      appliedDate: response.data.data.appliedDate
    });
  } catch (error) {
    console.log('❌ Get Application by ID Failed:', error.message);
  }
}

async function testSubmitNewApplication() {
  try {
    console.log('\n🧪 Testing Submit New Application...');
    const newApplication = {
      studentId: "test123",
      studentName: "Test Student",
      studentEmail: "test@student.edu",
      institution: "National University of Lesotho",
      course: "Medicine",
      institutionId: 1
    };
    
    const response = await axios.post(`${BASE_URL}/applications`, newApplication);
    console.log('✅ New Application Submitted:', response.data.message);
    console.log('📋 New Application ID:', response.data.data.id);
    console.log('📋 Status:', response.data.data.status);
  } catch (error) {
    console.log('❌ Submit Application Failed:', error.message);
  }
}

async function testUpdateApplicationStatus() {
  try {
    console.log('\n🧪 Testing Update Application Status...');
    
    // First get current status
    const currentApp = await axios.get(`${BASE_URL}/applications/1`);
    console.log('📋 Current Status:', currentApp.data.data.status);
    
    // Update to Under Review
    const updateResponse = await axios.patch(`${BASE_URL}/applications/1/status`, {
      status: "Under Review"
    });
    
    console.log('✅ Status Updated:', updateResponse.data.message);
    console.log('📋 New Status:', updateResponse.data.data.status);
    
  } catch (error) {
    console.log('❌ Update Status Failed:', error.message);
  }
}

async function testAdminApplications() {
  try {
    console.log('\n🧪 Testing Admin Applications Endpoint...');
    
    const response = await axios.get(`${BASE_URL}/admin/applications`);
    console.log('✅ Admin Applications:', response.data.count, 'total applications');
    
    // Test with filters
    const filteredResponse = await axios.get(`${BASE_URL}/admin/applications?status=Initial Parties&institution=Botho University`);
    console.log('✅ Admin Filtered:', filteredResponse.data.count, 'filtered applications');
    
  } catch (error) {
    console.log('❌ Admin Applications Test Failed:', error.message);
  }
}

async function testAdminOverview() {
  try {
    console.log('\n🧪 Testing Admin Overview...');
    
    const response = await axios.get(`${BASE_URL}/admin/overview`);
    console.log('✅ Admin Overview Data:');
    console.log('📊 Total Applications:', response.data.data.totalApplications);
    console.log('⏳ Pending Applications:', response.data.data.pendingApplications);
    console.log('⭐ Total Reviews:', response.data.data.totalReviews);
    console.log('🏫 Total Institutions:', response.data.data.totalInstitutions);
    
    console.log('\n📈 University Stats:');
    response.data.data.universityStats.forEach(stat => {
      console.log(`   ${stat.name}: ${stat.totalApplications} apps, ${stat.totalReviews} reviews`);
    });
    
  } catch (error) {
    console.log('❌ Admin Overview Test Failed:', error.message);
  }
}

async function testInstitutions() {
  try {
    console.log('\n🧪 Testing Institutions...');
    
    const response = await axios.get(`${BASE_URL}/institutions`);
    console.log('✅ Institutions:', response.data.count, 'institutions loaded');
    
    // Test single institution
    const singleInst = await axios.get(`${BASE_URL}/institutions/1`);
    console.log('✅ Single Institution:', singleInst.data.data.name);
    
  } catch (error) {
    console.log('❌ Institutions Test Failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Backend API Tests...\n');
  
  await testHealthCheck();
  await testInstitutions();
  await testGetAllApplications();
  await testGetApplicationsWithFilters();
  await testGetApplicationById();
  await testSubmitNewApplication();
  await testUpdateApplicationStatus();
  await testAdminApplications();
  await testAdminOverview();
  
  console.log('\n🎉 All tests completed!');
}

// Run the tests
runAllTests().catch(console.error);

// INTEGRATION TEST SUITE
// Sprint 4 - T040 Integration Tests
// End-to-end workflow tests for critical user paths

const axios = require('axios');
const assert = require('assert');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

// Test data
const testUser = {
  name: 'Test User Integration',
  email: `test.integration.${Date.now()}@example.com`,
  password: 'testpassword123'
};

const testAdmin = {
  email: 'admin@example.com', // Assuming admin account exists
  password: 'admin123'
};

const testEquipment = {
  name: 'Test Equipment Integration',
  description: 'Test equipment for integration testing',
  category: 'excavator',
  dailyRate: 150,
  status: 'available',
  imageUrl: 'https://example.com/test-image.jpg',
  specifications: 'Test specifications for integration testing'
};

// Helper functions
class IntegrationTestSuite {
  constructor() {
    this.userToken = null;
    this.adminToken = null;
    this.createdEquipment = null;
    this.createdReservation = null;
    this.testResults = [];
  }

  // Log test results
  logTest(testName, passed, message = '') {
    const result = { testName, passed, message, timestamp: new Date() };
    this.testResults.push(result);
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${testName}${message ? ' - ' + message : ''}`);
  }

  // Make authenticated API request
  async makeAuthenticatedRequest(method, endpoint, data = null, token = null) {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    return axios(config);
  }

  // Test 1: User Registration and Authentication
  async testUserRegistrationFlow() {
    console.log('\n🧪 Testing User Registration and Authentication Flow...');
    
    try {
      // Test user registration
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      
      assert.strictEqual(registerResponse.status, 201);
      assert(registerResponse.data.token);
      assert(registerResponse.data.user);
      assert.strictEqual(registerResponse.data.user.email, testUser.email);
      
      this.userToken = registerResponse.data.token;
      this.logTest('User Registration', true, 'User registered successfully');

      // Test user login
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      assert.strictEqual(loginResponse.status, 200);
      assert(loginResponse.data.token);
      this.logTest('User Login', true, 'User logged in successfully');

      // Test getting user profile
      const profileResponse = await this.makeAuthenticatedRequest('GET', '/api/auth/me', null, this.userToken);
      
      assert.strictEqual(profileResponse.status, 200);
      assert.strictEqual(profileResponse.data.user.email, testUser.email);
      this.logTest('User Profile Retrieval', true, 'User profile retrieved successfully');

    } catch (error) {
      this.logTest('User Registration Flow', false, error.message);
      throw error;
    }
  }

  // Test 2: Admin Authentication and Equipment Management
  async testAdminEquipmentManagement() {
    console.log('\n🧪 Testing Admin Equipment Management...');
    
    try {
      // Admin login (assuming admin account exists)
      try {
        const adminLoginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, testAdmin);
        this.adminToken = adminLoginResponse.data.token;
        this.logTest('Admin Login', true, 'Admin logged in successfully');
      } catch (error) {
        this.logTest('Admin Login', false, 'Admin account may not exist - skipping admin tests');
        return;
      }

      // Test equipment creation
      const createEquipmentResponse = await this.makeAuthenticatedRequest(
        'POST', 
        '/api/equipment', 
        testEquipment, 
        this.adminToken
      );

      assert.strictEqual(createEquipmentResponse.status, 201);
      assert(createEquipmentResponse.data.equipment);
      
      this.createdEquipment = createEquipmentResponse.data.equipment;
      this.logTest('Equipment Creation', true, 'Equipment created successfully');

      // Test equipment listing
      const listEquipmentResponse = await axios.get(`${API_BASE_URL}/api/equipment`);
      
      assert.strictEqual(listEquipmentResponse.status, 200);
      assert(Array.isArray(listEquipmentResponse.data));
      
      const createdEquipmentInList = listEquipmentResponse.data.find(
        eq => eq._id === this.createdEquipment._id
      );
      assert(createdEquipmentInList);
      this.logTest('Equipment Listing', true, 'Equipment appears in listing');

      // Test equipment update
      const updatedEquipmentData = {
        ...testEquipment,
        dailyRate: 175,
        description: 'Updated test equipment description'
      };

      const updateEquipmentResponse = await this.makeAuthenticatedRequest(
        'PUT',
        `/api/equipment/${this.createdEquipment._id}`,
        updatedEquipmentData,
        this.adminToken
      );

      assert.strictEqual(updateEquipmentResponse.status, 200);
      assert.strictEqual(updateEquipmentResponse.data.equipment.dailyRate, 175);
      this.logTest('Equipment Update', true, 'Equipment updated successfully');

    } catch (error) {
      this.logTest('Admin Equipment Management', false, error.message);
      throw error;
    }
  }

  // Test 3: Equipment Browsing and Reservation Creation
  async testReservationWorkflow() {
    console.log('\n🧪 Testing Reservation Workflow...');
    
    try {
      if (!this.createdEquipment) {
        this.logTest('Reservation Workflow', false, 'No equipment available for reservation');
        return;
      }

      // Test equipment details retrieval
      const equipmentDetailsResponse = await axios.get(`${API_BASE_URL}/api/equipment/${this.createdEquipment._id}`);
      
      assert.strictEqual(equipmentDetailsResponse.status, 200);
      assert.strictEqual(equipmentDetailsResponse.data._id, this.createdEquipment._id);
      this.logTest('Equipment Details Retrieval', true, 'Equipment details retrieved successfully');

      // Test reservation creation
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

      const reservationData = {
        equipment: this.createdEquipment._id,
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: dayAfterTomorrow.toISOString().split('T')[0],
        notes: 'Integration test reservation'
      };

      const createReservationResponse = await this.makeAuthenticatedRequest(
        'POST',
        '/api/reservations',
        reservationData,
        this.userToken
      );

      assert.strictEqual(createReservationResponse.status, 201);
      assert(createReservationResponse.data.reservation);
      assert.strictEqual(createReservationResponse.data.reservation.status, 'pending');
      
      this.createdReservation = createReservationResponse.data.reservation;
      this.logTest('Reservation Creation', true, 'Reservation created successfully');

      // Test reservation listing
      const listReservationsResponse = await this.makeAuthenticatedRequest(
        'GET',
        '/api/reservations',
        null,
        this.userToken
      );

      assert.strictEqual(listReservationsResponse.status, 200);
      assert(Array.isArray(listReservationsResponse.data));
      
      const createdReservationInList = listReservationsResponse.data.find(
        res => res._id === this.createdReservation._id
      );
      assert(createdReservationInList);
      this.logTest('Reservation Listing', true, 'Reservation appears in user\'s list');

    } catch (error) {
      this.logTest('Reservation Workflow', false, error.message);
      throw error;
    }
  }

  // Test 4: Reservation Management (Edit and Cancel)
  async testReservationManagement() {
    console.log('\n🧪 Testing Reservation Management...');
    
    try {
      if (!this.createdReservation) {
        this.logTest('Reservation Management', false, 'No reservation available for management');
        return;
      }

      // Test reservation update
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 5);

      const updatedReservationData = {
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: dayAfterTomorrow.toISOString().split('T')[0],
        notes: 'Updated integration test reservation'
      };

      const updateReservationResponse = await this.makeAuthenticatedRequest(
        'PUT',
        `/api/reservations/${this.createdReservation._id}`,
        updatedReservationData,
        this.userToken
      );

      assert.strictEqual(updateReservationResponse.status, 200);
      assert(updateReservationResponse.data.reservation);
      this.logTest('Reservation Update', true, 'Reservation updated successfully');

      // Test reservation cancellation
      const cancelReservationResponse = await this.makeAuthenticatedRequest(
        'DELETE',
        `/api/reservations/${this.createdReservation._id}`,
        null,
        this.userToken
      );

      assert.strictEqual(cancelReservationResponse.status, 200);
      this.logTest('Reservation Cancellation', true, 'Reservation cancelled successfully');

    } catch (error) {
      this.logTest('Reservation Management', false, error.message);
      throw error;
    }
  }

  // Test 5: Admin Statistics and Reporting
  async testAdminStatistics() {
    console.log('\n🧪 Testing Admin Statistics and Reporting...');
    
    try {
      if (!this.adminToken) {
        this.logTest('Admin Statistics', false, 'Admin token not available');
        return;
      }

      // Test statistics retrieval
      const statisticsResponse = await this.makeAuthenticatedRequest(
        'GET',
        '/api/admin/statistics',
        null,
        this.adminToken
      );

      assert.strictEqual(statisticsResponse.status, 200);
      assert(statisticsResponse.data.totalEquipment !== undefined);
      assert(statisticsResponse.data.availableEquipment !== undefined);
      assert(statisticsResponse.data.totalReservations !== undefined);
      assert(statisticsResponse.data.totalUsers !== undefined);
      
      this.logTest('Admin Statistics Retrieval', true, 'Admin statistics retrieved successfully');

    } catch (error) {
      this.logTest('Admin Statistics', false, error.message);
    }
  }

  // Test 6: Error Handling and Edge Cases
  async testErrorHandling() {
    console.log('\n🧪 Testing Error Handling and Edge Cases...');
    
    try {
      // Test invalid login
      try {
        await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
        this.logTest('Invalid Login Error Handling', false, 'Should have returned error for invalid login');
      } catch (error) {
        assert.strictEqual(error.response.status, 401);
        this.logTest('Invalid Login Error Handling', true, 'Invalid login properly rejected');
      }

      // Test unauthorized equipment creation
      try {
        await this.makeAuthenticatedRequest('POST', '/api/equipment', testEquipment, this.userToken);
        this.logTest('Unauthorized Equipment Creation', false, 'Should have rejected unauthorized equipment creation');
      } catch (error) {
        assert.strictEqual(error.response.status, 403);
        this.logTest('Unauthorized Equipment Creation', true, 'Unauthorized access properly rejected');
      }

      // Test invalid equipment ID
      try {
        await axios.get(`${API_BASE_URL}/api/equipment/invalid-id`);
        this.logTest('Invalid Equipment ID Handling', false, 'Should have returned error for invalid ID');
      } catch (error) {
        assert(error.response.status === 404 || error.response.status === 400);
        this.logTest('Invalid Equipment ID Handling', true, 'Invalid equipment ID properly handled');
      }

      // Test reservation without authentication
      try {
        await axios.post(`${API_BASE_URL}/api/reservations`, {
          equipment: this.createdEquipment?._id || 'test-id',
          startDate: '2025-10-01',
          endDate: '2025-10-02'
        });
        this.logTest('Unauthenticated Reservation', false, 'Should have required authentication');
      } catch (error) {
        assert.strictEqual(error.response.status, 401);
        this.logTest('Unauthenticated Reservation', true, 'Unauthenticated access properly rejected');
      }

    } catch (error) {
      this.logTest('Error Handling Tests', false, error.message);
    }
  }

  // Clean up test data
  async cleanupTestData() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Delete test equipment if it was created
      if (this.createdEquipment && this.adminToken) {
        await this.makeAuthenticatedRequest(
          'DELETE',
          `/api/equipment/${this.createdEquipment._id}`,
          null,
          this.adminToken
        );
        this.logTest('Equipment Cleanup', true, 'Test equipment deleted');
      }

      // Note: User cleanup would typically be done through admin panel or direct database access
      this.logTest('Cleanup Complete', true, 'Test data cleanup completed');

    } catch (error) {
      this.logTest('Cleanup', false, error.message);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Integration Test Suite...');
    console.log(`📍 API Base URL: ${API_BASE_URL}`);
    console.log(`🌐 Frontend Base URL: ${FRONTEND_BASE_URL}`);
    console.log('=' .repeat(60));

    const startTime = new Date();

    try {
      await this.testUserRegistrationFlow();
      await this.testAdminEquipmentManagement();
      await this.testReservationWorkflow();
      await this.testReservationManagement();
      await this.testAdminStatistics();
      await this.testErrorHandling();
    } catch (error) {
      console.error('Test suite failed:', error.message);
    } finally {
      await this.cleanupTestData();
    }

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    // Generate test report
    this.generateTestReport(duration);
  }

  // Generate test report
  generateTestReport(duration) {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 INTEGRATION TEST REPORT');
    console.log('=' .repeat(60));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`🕐 Duration: ${duration}s`);
    console.log(`📝 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.testName}: ${test.message}`);
        });
    }

    console.log('\n' + '=' .repeat(60));
    
    const status = failedTests === 0 ? '🎉 ALL TESTS PASSED!' : `⚠️ ${failedTests} TEST(S) FAILED`;
    console.log(status);
    console.log('=' .repeat(60));

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new IntegrationTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTestSuite;
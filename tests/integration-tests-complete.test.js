// COMPREHENSIVE INTEGRATION TEST SUITE
// End-to-end workflow testing for the construction equipment reservation system
// Sprint 4 - T040 Integration Tests

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../backend/server');

describe('Integration Test Suite', () => {
  let adminToken;
  let userToken;
  let otherUserToken;
  let testEquipment;
  let equipmentId;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_construction_equipment_integration';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clean database before each test
    await mongoose.connection.db.dropDatabase();
    
    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const setupTestData = async () => {
    // Create test users
    const User = mongoose.model('User');
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('adminpass123', 10),
      role: 'admin'
    });
    await adminUser.save();

    const regularUser = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: await bcrypt.hash('userpass123', 10),
      role: 'user'
    });
    await regularUser.save();
    userId = regularUser._id;

    const otherUser = new User({
      name: 'Other User',
      email: 'other@example.com',
      password: await bcrypt.hash('otherpass123', 10),
      role: 'user'
    });
    await otherUser.save();

    // Get authentication tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'adminpass123' });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'userpass123' });
    userToken = userLogin.body.token;

    const otherUserLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'other@example.com', password: 'otherpass123' });
    otherUserToken = otherUserLogin.body.token;

    // Create test equipment
    testEquipment = {
      name: 'Integration Test Excavator',
      description: 'A powerful excavator for integration testing',
      category: 'excavator',
      dailyRate: 250.00,
      status: 'available',
      imageUrl: 'https://example.com/excavator.jpg',
      specifications: 'Weight: 20 tons, Engine: 150HP'
    };

    const equipmentResponse = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testEquipment);
    equipmentId = equipmentResponse.body.equipment._id;
  };

  describe('Complete User Registration and Login Flow', () => {
    test('should complete full user registration and authentication flow', async () => {
      // Step 1: Register new user
      const newUser = {
        name: 'New Test User',
        email: 'newuser@example.com',
        password: 'newpass123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.token).toBeDefined();
      expect(registerResponse.body.user.role).toBe('user');
      
      const newUserToken = registerResponse.body.token;

      // Step 2: Use token to access protected endpoint
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${newUserToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.user.email).toBe(newUser.email);

      // Step 3: Login with credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: newUser.email,
          password: newUser.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user.name).toBe(newUser.name);

      // Step 4: Use login token
      const secondProfileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(secondProfileResponse.status).toBe(200);
    });

    test('should maintain data consistency across authentication operations', async () => {
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Consistency Test User',
          email: 'consistency@example.com',
          password: 'consistent123'
        });

      // Verify user exists in database
      const User = mongoose.model('User');
      const dbUser = await User.findOne({ email: 'consistency@example.com' });
      
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe('Consistency Test User');
      expect(dbUser.role).toBe('user');
      expect(dbUser._id.toString()).toBe(registerResponse.body.user.id);

      // Verify password is hashed
      expect(dbUser.password).not.toBe('consistent123');
      const isValidPassword = await bcrypt.compare('consistent123', dbUser.password);
      expect(isValidPassword).toBe(true);
    });
  });

  describe('Complete Equipment Management Workflow', () => {
    test('should handle complete equipment lifecycle', async () => {
      // Step 1: Admin creates equipment
      const newEquipment = {
        name: 'Lifecycle Test Crane',
        description: 'A crane for testing lifecycle',
        category: 'crane',
        dailyRate: 400.00,
        status: 'draft'
      };

      const createResponse = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newEquipment);

      expect(createResponse.status).toBe(201);
      const createdEquipmentId = createResponse.body.equipment._id;

      // Step 2: Equipment should not be visible to regular users (draft status)
      const userViewResponse = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${userToken}`);

      expect(userViewResponse.status).toBe(200);
      const userVisibleEquipment = userViewResponse.body.find(e => e._id === createdEquipmentId);
      expect(userVisibleEquipment).toBeUndefined();

      // Step 3: Admin updates equipment to published status
      const updateResponse = await request(app)
        .put(`/api/equipment/${createdEquipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'available' });

      expect(updateResponse.status).toBe(200);

      // Step 4: Equipment should now be visible to users
      const userViewResponse2 = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${userToken}`);

      const nowVisibleEquipment = userViewResponse2.body.find(e => e._id === createdEquipmentId);
      expect(nowVisibleEquipment).toBeDefined();
      expect(nowVisibleEquipment.status).toBe('available');

      // Step 5: User can view equipment details
      const detailResponse = await request(app)
        .get(`/api/equipment/${createdEquipmentId}`);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.name).toBe(newEquipment.name);

      // Step 6: Admin can delete equipment (no active reservations)
      const deleteResponse = await request(app)
        .delete(`/api/equipment/${createdEquipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);

      // Step 7: Equipment should be gone
      const finalCheckResponse = await request(app)
        .get(`/api/equipment/${createdEquipmentId}`);

      expect(finalCheckResponse.status).toBe(404);
    });

    test('should prevent unauthorized equipment operations', async () => {
      // User tries to create equipment
      const unauthorizedCreateResponse = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testEquipment);

      expect(unauthorizedCreateResponse.status).toBe(403);

      // User tries to update equipment
      const unauthorizedUpdateResponse = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked Equipment' });

      expect(unauthorizedUpdateResponse.status).toBe(403);

      // User tries to delete equipment
      const unauthorizedDeleteResponse = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(unauthorizedDeleteResponse.status).toBe(403);

      // Verify equipment is unchanged
      const equipmentCheckResponse = await request(app)
        .get(`/api/equipment/${equipmentId}`);

      expect(equipmentCheckResponse.status).toBe(200);
      expect(equipmentCheckResponse.body.name).toBe(testEquipment.name);
    });
  });

  describe('Complete Reservation Workflow', () => {
    test('should handle complete reservation lifecycle', async () => {
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      // Step 1: User creates reservation
      const createReservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes: 'Integration test reservation'
        });

      expect(createReservationResponse.status).toBe(201);
      expect(createReservationResponse.body.reservation.status).toBe('pending');
      expect(createReservationResponse.body.reservation.totalCost).toBe(500); // 2 days * 250

      const reservationId = createReservationResponse.body.reservation._id;

      // Step 2: User can view their reservation
      const userReservationsResponse = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(userReservationsResponse.status).toBe(200);
      expect(userReservationsResponse.body).toHaveLength(1);
      expect(userReservationsResponse.body[0]._id).toBe(reservationId);

      // Step 3: Admin can see all reservations
      const adminReservationsResponse = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminReservationsResponse.status).toBe(200);
      expect(adminReservationsResponse.body).toHaveLength(1);
      expect(adminReservationsResponse.body[0]._id).toBe(reservationId);

      // Step 4: Admin confirms reservation
      const confirmResponse = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.body.reservation.status).toBe('confirmed');

      // Step 5: User can no longer edit confirmed reservation
      const userUpdateResponse = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ notes: 'Trying to update confirmed reservation' });

      expect(userUpdateResponse.status).toBe(400);

      // Step 6: Admin activates reservation
      const activateResponse = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });

      expect(activateResponse.status).toBe(200);

      // Step 7: Admin completes reservation
      const completeResponse = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.reservation.status).toBe('completed');

      // Step 8: Verify final reservation state
      const finalReservationResponse = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(finalReservationResponse.status).toBe(200);
      expect(finalReservationResponse.body.status).toBe('completed');
    });

    test('should handle reservation conflicts correctly', async () => {
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      // Step 1: First user creates reservation
      const firstReservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes: 'First reservation'
        });

      expect(firstReservationResponse.status).toBe(201);
      const firstReservationId = firstReservationResponse.body.reservation._id;

      // Step 2: Admin confirms first reservation
      await request(app)
        .put(`/api/reservations/${firstReservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      // Step 3: Second user tries to create overlapping reservation
      const conflictingReservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(startDate.getTime() + 12 * 60 * 60 * 1000).toISOString(), // Half day later
          endDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Conflicting reservation'
        });

      expect(conflictingReservationResponse.status).toBe(400);
      expect(conflictingReservationResponse.body.error).toMatch(/already reserved/);

      // Step 4: Second user can create non-overlapping reservation
      const nonOverlappingReservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Day after first reservation ends
          endDate: new Date(endDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Non-overlapping reservation'
        });

      expect(nonOverlappingReservationResponse.status).toBe(201);

      // Step 5: Verify both reservations exist
      const allReservationsResponse = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(allReservationsResponse.status).toBe(200);
      expect(allReservationsResponse.body).toHaveLength(2);
    });

    test('should handle reservation cancellation workflow', async () => {
      // Step 1: Create reservation
      const reservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Cancellation test reservation'
        });

      expect(reservationResponse.status).toBe(201);
      const reservationId = reservationResponse.body.reservation._id;

      // Step 2: User cancels pending reservation
      const cancelResponse = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(cancelResponse.status).toBe(200);

      // Step 3: Verify reservation is gone
      const checkResponse = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(checkResponse.status).toBe(404);

      // Step 4: Create another reservation for confirmed cancellation test
      const secondReservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        });

      const secondReservationId = secondReservationResponse.body.reservation._id;

      // Step 5: Admin confirms reservation
      await request(app)
        .put(`/api/reservations/${secondReservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      // Step 6: User cannot cancel confirmed reservation
      const failedCancelResponse = await request(app)
        .delete(`/api/reservations/${secondReservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(failedCancelResponse.status).toBe(400);

      // Step 7: Admin can cancel confirmed reservation
      const adminCancelResponse = await request(app)
        .delete(`/api/reservations/${secondReservationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminCancelResponse.status).toBe(200);
    });
  });

  describe('Admin Dashboard Integration', () => {
    beforeEach(async () => {
      // Create some test data for dashboard
      const Equipment = mongoose.model('Equipment');
      const Reservation = mongoose.model('Reservation');

      // Create additional equipment
      const additionalEquipment = [
        {
          name: 'Dashboard Test Crane',
          description: 'Crane for dashboard testing',
          category: 'crane',
          dailyRate: 300,
          status: 'available'
        },
        {
          name: 'Dashboard Test Bulldozer',
          description: 'Bulldozer for dashboard testing',
          category: 'bulldozer',
          dailyRate: 350,
          status: 'maintenance'
        }
      ];

      for (const equip of additionalEquipment) {
        const equipment = new Equipment(equip);
        await equipment.save();
      }

      // Create test reservations with different statuses
      const testReservations = [
        {
          user: userId,
          equipment: equipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          totalCost: 250,
          status: 'pending'
        },
        {
          user: userId,
          equipment: equipmentId,
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          totalCost: 250,
          status: 'confirmed'
        }
      ];

      for (const reservation of testReservations) {
        const res = new Reservation(reservation);
        await res.save();
      }
    });

    test('should provide accurate statistics for admin dashboard', async () => {
      const statsResponse = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body).toHaveProperty('totalEquipment');
      expect(statsResponse.body).toHaveProperty('availableEquipment');
      expect(statsResponse.body).toHaveProperty('totalReservations');
      expect(statsResponse.body).toHaveProperty('pendingReservations');
      expect(statsResponse.body).toHaveProperty('totalUsers');

      expect(statsResponse.body.totalEquipment).toBe(3); // Original + 2 additional
      expect(statsResponse.body.availableEquipment).toBe(2); // 2 available, 1 maintenance
      expect(statsResponse.body.totalReservations).toBe(2);
      expect(statsResponse.body.pendingReservations).toBe(1);
      expect(statsResponse.body.totalUsers).toBe(3); // Admin, user, other user
    });

    test('should deny statistics access to regular users', async () => {
      const statsResponse = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${userToken}`);

      expect(statsResponse.status).toBe(403);
      expect(statsResponse.body.error).toMatch(/Admin access required/);
    });
  });

  describe('Cross-functional Integration Tests', () => {
    test('should maintain data integrity across multiple operations', async () => {
      // Step 1: Create equipment and make reservation
      const equipmentResponse = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Integrity Test Equipment',
          description: 'Equipment for integrity testing',
          category: 'loader',
          dailyRate: 200,
          status: 'available'
        });

      const integrityEquipmentId = equipmentResponse.body.equipment._id;

      const reservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: integrityEquipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        });

      const reservationId = reservationResponse.body.reservation._id;

      // Step 2: Confirm reservation
      await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      // Step 3: Try to delete equipment with active reservation (should fail)
      const deleteResponse = await request(app)
        .delete(`/api/equipment/${integrityEquipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(400);

      // Step 4: Cancel reservation
      await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Step 5: Now equipment deletion should work
      const deleteResponse2 = await request(app)
        .delete(`/api/equipment/${integrityEquipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse2.status).toBe(200);

      // Step 6: Verify equipment is gone
      const equipmentCheckResponse = await request(app)
        .get(`/api/equipment/${integrityEquipmentId}`);

      expect(equipmentCheckResponse.status).toBe(404);
    });

    test('should handle concurrent operations correctly', async () => {
      // Test concurrent reservation attempts on same equipment
      const reservationData = {
        equipment: equipmentId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      };

      const promises = [
        request(app).post('/api/reservations').set('Authorization', `Bearer ${userToken}`).send(reservationData),
        request(app).post('/api/reservations').set('Authorization', `Bearer ${otherUserToken}`).send(reservationData)
      ];

      const responses = await Promise.all(promises);
      
      // One should succeed, one should fail due to conflict
      const successResponses = responses.filter(r => r.status === 201);
      const failureResponses = responses.filter(r => r.status === 400);

      expect(successResponses).toHaveLength(1);
      expect(failureResponses).toHaveLength(1);
      expect(failureResponses[0].body.error).toMatch(/already reserved/);
    });

    test('should maintain proper user isolation', async () => {
      // Create reservations for different users
      const userReservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'User reservation'
        });

      const otherUserReservationResponse = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Other user reservation'
        });

      const userReservationId = userReservationResponse.body.reservation._id;
      const otherUserReservationId = otherUserReservationResponse.body.reservation._id;

      // Verify user can only see own reservations
      const userReservationsResponse = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(userReservationsResponse.body).toHaveLength(1);
      expect(userReservationsResponse.body[0]._id).toBe(userReservationId);

      // Verify user cannot access other user's reservation
      const unauthorizedAccessResponse = await request(app)
        .get(`/api/reservations/${otherUserReservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(unauthorizedAccessResponse.status).toBe(403);

      // Verify admin can see all reservations
      const adminReservationsResponse = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminReservationsResponse.body).toHaveLength(2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed requests gracefully', async () => {
      const malformedRequests = [
        { endpoint: '/api/equipment', method: 'post', data: { invalidField: 'value' } },
        { endpoint: '/api/reservations', method: 'post', data: { equipment: 'invalid-id' } },
        { endpoint: '/api/auth/register', method: 'post', data: { email: 'not-an-email' } }
      ];

      for (const req of malformedRequests) {
        const response = await request(app)
          [req.method](req.endpoint)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(req.data);

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
        expect(response.body.error).toBeDefined();
      }
    });

    test('should handle database connection issues gracefully', async () => {
      // This is a conceptual test - in real scenarios you'd mock database failures
      const response = await request(app)
        .get('/api/equipment');

      expect(response.status).toBeLessThan(500);
    });

    test('should handle authentication edge cases', async () => {
      const invalidTokens = [
        'Bearer invalid-token',
        'Bearer ',
        'InvalidFormat',
        ''
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', token);

        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
      }
    });
  });

  describe('Performance and Scalability Tests', () => {
    test('should handle multiple simultaneous users', async () => {
      // Create multiple users
      const users = [];
      for (let i = 0; i < 5; i++) {
        const userResponse = await request(app)
          .post('/api/auth/register')
          .send({
            name: `Performance User ${i}`,
            email: `perf${i}@example.com`,
            password: 'perfpass123'
          });
        users.push(userResponse.body.token);
      }

      // Each user tries to get equipment list simultaneously
      const promises = users.map(token => 
        request(app)
          .get('/api/equipment')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    test('should handle bulk operations efficiently', async () => {
      // Create multiple equipment items
      const equipmentPromises = [];
      for (let i = 0; i < 10; i++) {
        equipmentPromises.push(
          request(app)
            .post('/api/equipment')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
              name: `Bulk Equipment ${i}`,
              description: `Description ${i}`,
              category: 'other',
              dailyRate: 100 + i * 10,
              status: 'available'
            })
        );
      }

      const equipmentResponses = await Promise.all(equipmentPromises);
      
      // All should be created successfully
      equipmentResponses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all equipment appears in list
      const listResponse = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listResponse.body.length).toBeGreaterThanOrEqual(10);
    });
  });
});

// Test Utilities
class IntegrationTestUtils {
  static async createTestUser(userData) {
    return await request(app)
      .post('/api/auth/register')
      .send(userData);
  }

  static async createTestEquipment(token, equipmentData) {
    return await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${token}`)
      .send(equipmentData);
  }

  static async createTestReservation(token, reservationData) {
    return await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send(reservationData);
  }

  static generateFutureDate(daysFromNow) {
    return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  }

  static async waitForDatabase() {
    // Utility to wait for database operations to complete
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

module.exports = IntegrationTestUtils;
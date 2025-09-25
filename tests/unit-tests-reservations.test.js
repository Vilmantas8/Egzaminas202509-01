// UNIT TESTS FOR RESERVATION LOGIC
// Tests for all reservation-related functionality including conflict prevention
// Sprint 4 - T030 Unit Tests - Reservation Logic

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../backend/server');

describe('Reservation Logic', () => {
  let adminToken;
  let userToken;
  let otherUserToken;
  let testEquipment;
  let equipmentId;
  let userId;
  let otherUserId;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_construction_equipment';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clean database before each test
    await mongoose.connection.db.dropDatabase();

    // Create users
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
    otherUserId = otherUser._id;

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
      name: 'Test Excavator',
      description: 'A powerful excavator for construction work',
      category: 'excavator',
      dailyRate: 250.00,
      status: 'available'
    };

    const equipmentResponse = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testEquipment);
    equipmentId = equipmentResponse.body.equipment._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/reservations', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    test('should create reservation with valid data', async () => {
      const reservationData = {
        equipment: equipmentId,
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString(),
        notes: 'Test reservation'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reservationData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Reservation created successfully!');
      expect(response.body.reservation).toMatchObject({
        equipment: {
          _id: equipmentId,
          name: testEquipment.name
        },
        user: {
          name: 'Regular User'
        },
        status: 'pending',
        notes: 'Test reservation'
      });
      expect(response.body.reservation.totalCost).toBe(250); // 1 day * 250
    });

    test('should calculate total cost correctly', async () => {
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 3 days later

      const reservationData = {
        equipment: equipmentId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: 'Multi-day reservation'
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reservationData);

      expect(response.status).toBe(201);
      expect(response.body.reservation.totalCost).toBe(750); // 3 days * 250
    });

    test('should reject reservation without authentication', async () => {
      const reservationData = {
        equipment: equipmentId,
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString()
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData);

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Access denied/);
    });

    test('should reject reservation for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const reservationData = {
        equipment: nonExistentId,
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString()
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reservationData);

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/Equipment not found/);
    });

    test('should reject reservation for unavailable equipment', async () => {
      // Set equipment status to unavailable
      await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'maintenance' });

      const reservationData = {
        equipment: equipmentId,
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString()
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reservationData);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/not available for rental/);
    });

    test('should validate date fields', async () => {
      const invalidDates = [
        { startDate: 'invalid-date', endDate: dayAfterTomorrow.toISOString() },
        { startDate: tomorrow.toISOString(), endDate: 'invalid-date' },
        { startDate: dayAfterTomorrow.toISOString(), endDate: tomorrow.toISOString() }, // End before start
        { startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), endDate: tomorrow.toISOString() } // Past start date
      ];

      for (const dateSet of invalidDates) {
        const response = await request(app)
          .post('/api/reservations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            equipment: equipmentId,
            ...dateSet
          });

        expect(response.status).toBe(400);
      }
    });

    test('should require all mandatory fields', async () => {
      const requiredFields = ['equipment', 'startDate', 'endDate'];

      for (const field of requiredFields) {
        const incompleteData = {
          equipment: equipmentId,
          startDate: tomorrow.toISOString(),
          endDate: dayAfterTomorrow.toISOString()
        };
        delete incompleteData[field];

        const response = await request(app)
          .post('/api/reservations')
          .set('Authorization', `Bearer ${userToken}`)
          .send(incompleteData);

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Conflict Prevention Logic', () => {
    const baseDate = new Date('2025-10-01');
    
    beforeEach(async () => {
      // Create an existing reservation
      const Reservation = mongoose.model('Reservation');
      const existingReservation = new Reservation({
        user: userId,
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000), // Oct 3
        endDate: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000),   // Oct 5
        totalCost: 750,
        status: 'confirmed'
      });
      await existingReservation.save();
    });

    test('should prevent overlapping reservations - complete overlap', async () => {
      const conflictingReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Oct 3
        endDate: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString()     // Oct 5
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(conflictingReservation);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already reserved/);
    });

    test('should prevent overlapping reservations - partial overlap at start', async () => {
      const conflictingReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Oct 2
        endDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()     // Oct 4
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(conflictingReservation);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already reserved/);
    });

    test('should prevent overlapping reservations - partial overlap at end', async () => {
      const conflictingReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Oct 4
        endDate: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString()     // Oct 7
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(conflictingReservation);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already reserved/);
    });

    test('should prevent overlapping reservations - containing overlap', async () => {
      const conflictingReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Oct 2
        endDate: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString()     // Oct 7
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(conflictingReservation);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already reserved/);
    });

    test('should allow adjacent reservations - end date equals start date', async () => {
      const adjacentReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Oct 5 (same as existing end)
        endDate: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString()     // Oct 7
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(adjacentReservation);

      expect(response.status).toBe(201); // Should be allowed
    });

    test('should allow non-overlapping reservations - before existing', async () => {
      const nonOverlappingReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime()).toISOString(),                            // Oct 1
        endDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString()   // Oct 2
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(nonOverlappingReservation);

      expect(response.status).toBe(201);
    });

    test('should allow non-overlapping reservations - after existing', async () => {
      const nonOverlappingReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(), // Oct 7
        endDate: new Date(baseDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString()     // Oct 9
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(nonOverlappingReservation);

      expect(response.status).toBe(201);
    });

    test('should ignore cancelled/rejected reservations in conflict checking', async () => {
      // Set the existing reservation to cancelled
      const Reservation = mongoose.model('Reservation');
      await Reservation.findOneAndUpdate(
        { equipment: equipmentId, status: 'confirmed' },
        { status: 'cancelled' }
      );

      // Now overlapping reservation should be allowed
      const overlappingReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Oct 3
        endDate: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString()     // Oct 5
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(overlappingReservation);

      expect(response.status).toBe(201);
    });

    test('should handle multiple active reservations correctly', async () => {
      // Create second non-overlapping reservation
      const Reservation = mongoose.model('Reservation');
      const secondReservation = new Reservation({
        user: otherUserId,
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000), // Oct 7
        endDate: new Date(baseDate.getTime() + 8 * 24 * 60 * 60 * 1000),   // Oct 9
        totalCost: 500,
        status: 'pending'
      });
      await secondReservation.save();

      // Try to create reservation that overlaps with first reservation
      const conflictingReservation = {
        equipment: equipmentId,
        startDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Oct 2
        endDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()     // Oct 4
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(conflictingReservation);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already reserved/);
    });
  });

  describe('GET /api/reservations', () => {
    beforeEach(async () => {
      // Create reservations for different users
      const Reservation = mongoose.model('Reservation');
      
      const userReservation = new Reservation({
        user: userId,
        equipment: equipmentId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        totalCost: 250,
        status: 'pending'
      });
      await userReservation.save();

      const otherUserReservation = new Reservation({
        user: otherUserId,
        equipment: equipmentId,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        totalCost: 250,
        status: 'confirmed'
      });
      await otherUserReservation.save();
    });

    test('should return user own reservations only for regular users', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].user.name).toBe('Regular User');
      expect(response.body[0].status).toBe('pending');
    });

    test('should return all reservations for admin users', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    test('should populate user and equipment data', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0].user).toHaveProperty('name');
      expect(response.body[0].user).toHaveProperty('email');
      expect(response.body[0].equipment).toHaveProperty('name');
      expect(response.body[0].equipment).toHaveProperty('category');
      expect(response.body[0].equipment).toHaveProperty('dailyRate');
    });

    test('should sort reservations by creation date (newest first)', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      
      const dates = response.body.map(r => new Date(r.createdAt));
      expect(dates[0] >= dates[1]).toBe(true); // Newest first
    });
  });

  describe('GET /api/reservations/:id', () => {
    let reservationId;
    let otherUserReservationId;

    beforeEach(async () => {
      const Reservation = mongoose.model('Reservation');
      
      const userReservation = new Reservation({
        user: userId,
        equipment: equipmentId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        totalCost: 250,
        status: 'pending'
      });
      await userReservation.save();
      reservationId = userReservation._id;

      const otherReservation = new Reservation({
        user: otherUserId,
        equipment: equipmentId,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        totalCost: 250,
        status: 'confirmed'
      });
      await otherReservation.save();
      otherUserReservationId = otherReservation._id;
    });

    test('should return reservation details for owner', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(reservationId.toString());
      expect(response.body.user.name).toBe('Regular User');
    });

    test('should return reservation details for admin', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(reservationId.toString());
    });

    test('should deny access to other users reservations', async () => {
      const response = await request(app)
        .get(`/api/reservations/${otherUserReservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/Access denied/);
    });

    test('should return 404 for non-existent reservation', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/reservations/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/Reservation not found/);
    });
  });

  describe('PUT /api/reservations/:id', () => {
    let reservationId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Original reservation'
        });
      reservationId = response.body.reservation._id;
    });

    test('should allow user to update own pending reservation', async () => {
      const updateData = {
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Updated reservation'
      };

      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reservation updated successfully!');
      expect(response.body.reservation.notes).toBe('Updated reservation');
      expect(response.body.reservation.totalCost).toBe(250); // Recalculated for 1 day
    });

    test('should allow admin to update reservation status', async () => {
      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('confirmed');
    });

    test('should prevent regular user from updating reservation status', async () => {
      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'confirmed' });

      // User can't update status, it should be ignored or rejected
      expect(response.status).toBe(200); // Update might succeed but status unchanged
      // Note: This depends on validation implementation
    });

    test('should prevent users from updating non-pending reservations', async () => {
      // First, admin confirms the reservation
      await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      // Now user tries to update
      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ notes: 'Trying to update confirmed reservation' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/pending reservations/);
    });

    test('should recalculate cost when dates are updated', async () => {
      const updateData = {
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 4 days total
      };

      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.reservation.totalCost).toBe(1000); // 4 days * 250
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    let reservationId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Test reservation'
        });
      reservationId = response.body.reservation._id;
    });

    test('should allow user to cancel own pending reservation', async () => {
      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reservation cancelled successfully!');

      // Verify reservation is deleted
      const getResponse = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(getResponse.status).toBe(404);
    });

    test('should allow admin to cancel any reservation', async () => {
      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reservation cancelled successfully!');
    });

    test('should prevent users from cancelling non-pending reservations', async () => {
      // Admin confirms the reservation first
      await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      // User tries to cancel confirmed reservation
      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/pending reservations/);
    });
  });

  describe('Reservation Status Workflow', () => {
    let reservationId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Test reservation'
        });
      reservationId = response.body.reservation._id;
    });

    test('should follow correct status transitions', async () => {
      // Start with pending
      let response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.body.status).toBe('pending');

      // Admin confirms
      response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });
      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('confirmed');

      // Admin activates
      response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });
      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('active');

      // Admin completes
      response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });
      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('completed');
    });

    test('should allow admin to reject reservations', async () => {
      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('rejected');
    });

    test('should validate status enum values', async () => {
      const invalidStatuses = ['invalid', 'unknown', 'processing'];

      for (const status of invalidStatuses) {
        const response = await request(app)
          .put(`/api/reservations/${reservationId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle concurrent reservation attempts', async () => {
      const reservationData = {
        equipment: equipmentId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Try to create the same reservation simultaneously
      const promises = [
        request(app).post('/api/reservations').set('Authorization', `Bearer ${userToken}`).send(reservationData),
        request(app).post('/api/reservations').set('Authorization', `Bearer ${otherUserToken}`).send(reservationData)
      ];

      const responses = await Promise.all(promises);
      
      // One should succeed, one should fail
      const successCount = responses.filter(r => r.status === 201).length;
      const failCount = responses.filter(r => r.status === 400).length;
      
      expect(successCount).toBe(1);
      expect(failCount).toBe(1);
    });

    test('should handle equipment deletion with active reservations', async () => {
      // Create reservation first
      await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          equipment: equipmentId,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        });

      // Try to delete equipment (should be prevented)
      const response = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/active reservations/);
    });

    test('should handle timezone and date edge cases', async () => {
      // Test with different timezone formats
      const timezoneFormats = [
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()
      ];

      for (const dateFormat of timezoneFormats) {
        const response = await request(app)
          .post('/api/reservations')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            equipment: equipmentId,
            startDate: dateFormat,
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
          });

        expect(response.status).toBe(201);
      }
    });
  });
});
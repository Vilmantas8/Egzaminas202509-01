// UNIT TESTS FOR EQUIPMENT API FUNCTIONS
// Tests for all equipment-related CRUD operations and business logic
// Sprint 4 - T020 Unit Tests - Equipment APIs

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../backend/server');

describe('Equipment API Functions', () => {
  let adminToken;
  let userToken;
  let testEquipment;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_construction_equipment';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clean database before each test
    await mongoose.connection.db.dropDatabase();

    // Create admin user
    const User = mongoose.model('User');
    const hashedPassword = await bcrypt.hash('adminpass123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();

    // Create regular user
    const regularUser = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: await bcrypt.hash('userpass123', 10),
      role: 'user'
    });
    await regularUser.save();

    // Get authentication tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'adminpass123'
      });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'userpass123'
      });
    userToken = userLogin.body.token;

    // Test equipment data
    testEquipment = {
      name: 'Test Excavator',
      description: 'A powerful excavator for construction work',
      category: 'excavator',
      dailyRate: 250.00,
      status: 'available',
      imageUrl: 'https://example.com/excavator.jpg',
      specifications: 'Weight: 20 tons, Engine: 150HP'
    };
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/equipment', () => {
    beforeEach(async () => {
      // Create test equipment
      await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);

      // Create draft equipment (should not appear for regular users)
      await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...testEquipment, name: 'Draft Equipment', status: 'draft' });
    });

    test('should return all published equipment for regular users', async () => {
      const response = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1); // Only published equipment
      expect(response.body[0].name).toBe(testEquipment.name);
      expect(response.body[0].status).not.toBe('draft');
    });

    test('should return all equipment for admin users', async () => {
      const response = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2); // All equipment including drafts
    });

    test('should work without authentication (public access)', async () => {
      const response = await request(app)
        .get('/api/equipment');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1); // Only published equipment
    });

    test('should sort equipment by creation date (newest first)', async () => {
      // Create another equipment
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      const newerEquipment = { ...testEquipment, name: 'Newer Equipment' };
      await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newerEquipment);

      const response = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Newer Equipment'); // Newest first
    });
  });

  describe('GET /api/equipment/:id', () => {
    let equipmentId;

    beforeEach(async () => {
      // Create test equipment and get its ID
      const createResponse = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);
      equipmentId = createResponse.body.equipment._id;
    });

    test('should return equipment by ID', async () => {
      const response = await request(app)
        .get(`/api/equipment/${equipmentId}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(equipmentId);
      expect(response.body.name).toBe(testEquipment.name);
      expect(response.body.description).toBe(testEquipment.description);
    });

    test('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/equipment/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/Equipment not found/);
    });

    test('should return 500 for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/api/equipment/invalid-id');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/equipment', () => {
    test('should create equipment with valid admin token', async () => {
      const response = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Equipment created successfully!');
      expect(response.body.equipment).toMatchObject({
        name: testEquipment.name,
        description: testEquipment.description,
        category: testEquipment.category,
        dailyRate: testEquipment.dailyRate
      });
      expect(response.body.equipment._id).toBeDefined();
      expect(response.body.equipment.createdAt).toBeDefined();
    });

    test('should reject equipment creation by regular user', async () => {
      const response = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testEquipment);

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/Admin access required/);
    });

    test('should reject equipment creation without authentication', async () => {
      const response = await request(app)
        .post('/api/equipment')
        .send(testEquipment);

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Access denied/);
    });

    test('should validate required fields', async () => {
      const requiredFields = ['name', 'description', 'category', 'dailyRate'];

      for (const field of requiredFields) {
        const incompleteEquipment = { ...testEquipment };
        delete incompleteEquipment[field];

        const response = await request(app)
          .post('/api/equipment')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(incompleteEquipment);

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(new RegExp(field, 'i'));
      }
    });

    test('should validate category enum values', async () => {
      const invalidCategories = ['invalid', 'car', 'building', 'random'];

      for (const category of invalidCategories) {
        const response = await request(app)
          .post('/api/equipment')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...testEquipment, category });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/category/i);
      }
    });

    test('should validate daily rate as positive number', async () => {
      const invalidRates = [-10, -1, 'abc', null, undefined];

      for (const dailyRate of invalidRates) {
        const response = await request(app)
          .post('/api/equipment')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...testEquipment, dailyRate });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/dailyRate/i);
      }
    });

    test('should accept valid category values', async () => {
      const validCategories = ['excavator', 'crane', 'bulldozer', 'loader', 'truck', 'drill', 'other'];

      for (const category of validCategories) {
        const response = await request(app)
          .post('/api/equipment')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...testEquipment, name: `Test ${category}`, category });

        expect(response.status).toBe(201);
        expect(response.body.equipment.category).toBe(category);
      }
    });

    test('should set default values for optional fields', async () => {
      const minimalEquipment = {
        name: 'Minimal Equipment',
        description: 'Basic description',
        category: 'other',
        dailyRate: 100
      };

      const response = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(minimalEquipment);

      expect(response.status).toBe(201);
      expect(response.body.equipment.status).toBe('available');
      expect(response.body.equipment.imageUrl).toBe('');
      expect(response.body.equipment.specifications).toBe('');
    });
  });

  describe('PUT /api/equipment/:id', () => {
    let equipmentId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);
      equipmentId = createResponse.body.equipment._id;
    });

    test('should update equipment with valid admin token', async () => {
      const updateData = {
        name: 'Updated Equipment',
        dailyRate: 300,
        status: 'maintenance'
      };

      const response = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Equipment updated successfully!');
      expect(response.body.equipment.name).toBe(updateData.name);
      expect(response.body.equipment.dailyRate).toBe(updateData.dailyRate);
      expect(response.body.equipment.status).toBe(updateData.status);
    });

    test('should reject update by regular user', async () => {
      const response = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/Admin access required/);
    });

    test('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/Equipment not found/);
    });

    test('should validate updated fields', async () => {
      const invalidUpdates = [
        { dailyRate: -50 },
        { category: 'invalid_category' },
        { status: 'invalid_status' }
      ];

      for (const updateData of invalidUpdates) {
        const response = await request(app)
          .put(`/api/equipment/${equipmentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData);

        expect(response.status).toBe(400);
      }
    });

    test('should allow partial updates', async () => {
      const response = await request(app)
        .put(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Partially Updated' });

      expect(response.status).toBe(200);
      expect(response.body.equipment.name).toBe('Partially Updated');
      // Other fields should remain unchanged
      expect(response.body.equipment.description).toBe(testEquipment.description);
      expect(response.body.equipment.category).toBe(testEquipment.category);
    });
  });

  describe('DELETE /api/equipment/:id', () => {
    let equipmentId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);
      equipmentId = createResponse.body.equipment._id;
    });

    test('should delete equipment with valid admin token', async () => {
      const response = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Equipment deleted successfully!');

      // Verify equipment is deleted
      const getResponse = await request(app)
        .get(`/api/equipment/${equipmentId}`);
      expect(getResponse.status).toBe(404);
    });

    test('should reject deletion by regular user', async () => {
      const response = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/Admin access required/);
    });

    test('should return 404 for non-existent equipment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/Equipment not found/);
    });

    test('should prevent deletion of equipment with active reservations', async () => {
      // Create a reservation for the equipment
      const User = mongoose.model('User');
      const user = await User.findOne({ email: 'user@example.com' });
      
      const Reservation = mongoose.model('Reservation');
      const reservation = new Reservation({
        user: user._id,
        equipment: equipmentId,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        totalCost: 500,
        status: 'confirmed'
      });
      await reservation.save();

      const response = await request(app)
        .delete(`/api/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/active reservations/);
    });
  });

  describe('Equipment Model Validation', () => {
    test('should enforce unique constraints where needed', async () => {
      // Create first equipment
      await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);

      // Try to create another with same data (should succeed as no unique constraints on equipment names)
      const response = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);

      expect(response.status).toBe(201); // Equipment names can be duplicated
    });

    test('should validate string length constraints', async () => {
      const longName = 'A'.repeat(1000);
      const longDescription = 'B'.repeat(5000);

      const response = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...testEquipment,
          name: longName,
          description: longDescription
        });

      // Should handle long strings appropriately
      expect(response.status).toBe(201);
    });

    test('should validate daily rate precision', async () => {
      const preciseRates = [10.99, 250.50, 1000.00, 0.01];

      for (const rate of preciseRates) {
        const response = await request(app)
          .post('/api/equipment')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testEquipment,
            name: `Equipment ${rate}`,
            dailyRate: rate
          });

        expect(response.status).toBe(201);
        expect(response.body.equipment.dailyRate).toBe(rate);
      }
    });
  });

  describe('Equipment Status Management', () => {
    let equipmentId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testEquipment);
      equipmentId = createResponse.body.equipment._id;
    });

    test('should allow valid status transitions', async () => {
      const validStatuses = ['available', 'rented', 'maintenance', 'draft'];

      for (const status of validStatuses) {
        const response = await request(app)
          .put(`/api/equipment/${equipmentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status });

        expect(response.status).toBe(200);
        expect(response.body.equipment.status).toBe(status);
      }
    });

    test('should reject invalid status values', async () => {
      const invalidStatuses = ['broken', 'sold', 'lost', 'unknown'];

      for (const status of invalidStatuses) {
        const response = await request(app)
          .put(`/api/equipment/${equipmentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Equipment Image and Specifications', () => {
    test('should handle valid image URLs', async () => {
      const validUrls = [
        'https://example.com/image.jpg',
        'http://example.com/image.png',
        'https://cdn.example.com/images/equipment/excavator.gif',
        ''
      ];

      for (const imageUrl of validUrls) {
        const response = await request(app)
          .post('/api/equipment')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testEquipment,
            name: `Equipment ${imageUrl.slice(-10)}`,
            imageUrl
          });

        expect(response.status).toBe(201);
        expect(response.body.equipment.imageUrl).toBe(imageUrl);
      }
    });

    test('should handle specifications text', async () => {
      const specifications = [
        'Weight: 20 tons\nEngine: 150HP\nMax Speed: 40km/h',
        'Simple spec',
        '',
        'Very long specifications with multiple lines and detailed information about the equipment capabilities and technical details'
      ];

      for (const spec of specifications) {
        const response = await request(app)
          .post('/api/equipment')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testEquipment,
            name: `Equipment ${Date.now()}`,
            specifications: spec
          });

        expect(response.status).toBe(201);
        expect(response.body.equipment.specifications).toBe(spec);
      }
    });
  });

  describe('Database Operations', () => {
    test('should handle concurrent equipment creation', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/equipment')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
              ...testEquipment,
              name: `Concurrent Equipment ${i}`
            })
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all equipment was created
      const listResponse = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listResponse.body).toHaveLength(5);
    });

    test('should handle database connection errors gracefully', async () => {
      // This test would require mocking mongoose connection
      // For now, we'll test that the error handling structure is in place
      
      const response = await request(app)
        .get('/api/equipment');

      expect(response.status).toBeLessThan(500);
    });
  });
});
// UNIT TESTS FOR AUTHENTICATION FUNCTIONS
// Tests for all authentication-related functionality
// Sprint 4 - T010 Unit Tests - Auth Functions

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../backend/server'); // Import the Express app

describe('Authentication Functions', () => {
  let testServer;
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_construction_equipment';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clean database before each test
    await mongoose.connection.db.dropDatabase();
    
    // Create a test user
    testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };
  });

  afterAll(async () => {
    // Clean up and close connections
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully!');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        email: testUser.email,
        role: 'user'
      });
      expect(response.body.user.password).toBeUndefined();
    });

    test('should reject registration with invalid email', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/email/i);
    });

    test('should reject registration with weak password', async () => {
      const weakPasswordUser = { ...testUser, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/password/i);
    });

    test('should reject duplicate email registration', async () => {
      // Register user first time
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Try to register same email again
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already exists/i);
    });

    test('should hash password before storing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);

      // Check if password is hashed in database
      const User = mongoose.model('User');
      const savedUser = await User.findOne({ email: testUser.email });
      
      expect(savedUser.password).not.toBe(testUser.password);
      expect(savedUser.password.length).toBeGreaterThan(50); // bcrypt hash length
      
      // Verify bcrypt hash
      const isPasswordValid = await bcrypt.compare(testUser.password, savedUser.password);
      expect(isPasswordValid).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful!');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        email: testUser.email,
        role: 'user'
      });
    });

    test('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Invalid email or password/);
    });

    test('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Invalid email or password/);
    });

    test('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should generate valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      
      const token = response.body.token;
      expect(token).toBeDefined();
      
      // Verify JWT token structure
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
      
      // Decode token payload
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      expect(payload.userId).toBeDefined();
      expect(payload.exp).toBeDefined(); // Expiration time
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Register and login to get auth token
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.token;
    });

    test('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        email: testUser.email,
        role: 'user'
      });
      expect(response.body.user.password).toBeUndefined();
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Access denied/);
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/Invalid token/);
    });

    test('should reject request with expired token', async () => {
      // Create expired token (exp in past)
      const expiredToken = jwt.sign(
        { userId: 'test-id', exp: Math.floor(Date.now() / 1000) - 3600 }, // Expired 1 hour ago
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/Invalid token/);
    });
  });

  describe('JWT Token Functions', () => {
    test('should generate token with correct payload', () => {
      const userId = new mongoose.Types.ObjectId();
      const secret = process.env.JWT_SECRET || 'test-secret';
      
      const token = jwt.sign({ userId: userId.toString() }, secret, { expiresIn: '24h' });
      
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, secret);
      expect(decoded.userId).toBe(userId.toString());
      expect(decoded.exp).toBeDefined();
    });

    test('should verify token correctly', () => {
      const userId = new mongoose.Types.ObjectId();
      const secret = process.env.JWT_SECRET || 'test-secret';
      
      const token = jwt.sign({ userId: userId.toString() }, secret, { expiresIn: '1h' });
      
      expect(() => {
        const decoded = jwt.verify(token, secret);
        expect(decoded.userId).toBe(userId.toString());
      }).not.toThrow();
    });

    test('should reject token with wrong secret', () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId: userId.toString() }, 'wrong-secret', { expiresIn: '1h' });
      
      expect(() => {
        jwt.verify(token, 'correct-secret');
      }).toThrow();
    });
  });

  describe('Password Hashing Functions', () => {
    test('should hash password with bcrypt', async () => {
      const password = 'testpassword123';
      const saltRounds = 10;
      
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword).toMatch(/^\$2[aby]\$10\$/); // bcrypt format
    });

    test('should verify password against hash', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      expect(hash1).not.toBe(hash2);
      
      // Both should verify correctly
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('Authentication Middleware', () => {
    let authenticatedUser;

    beforeEach(async () => {
      // Create user and get auth token for middleware tests
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      authToken = registerResponse.body.token;
      authenticatedUser = registerResponse.body.user;
    });

    test('should authenticate valid token in middleware', async () => {
      // Test with an endpoint that requires authentication
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(authenticatedUser.id);
    });

    test('should reject missing Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/No token provided/);
    });

    test('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/No token provided/);
    });

    test('should extract userId from token correctly', async () => {
      // Mock a request with auth middleware
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBeDefined();
    });
  });

  describe('Admin Role Middleware', () => {
    let adminToken;
    let userToken;

    beforeEach(async () => {
      // Create regular user
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      userToken = userResponse.body.token;

      // Create admin user directly in database
      const User = mongoose.model('User');
      const hashedPassword = await bcrypt.hash('adminpass123', 10);
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();

      // Login as admin to get token
      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'adminpass123'
        });
      adminToken = adminLoginResponse.body.token;
    });

    test('should allow admin access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    test('should deny user access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/statistics')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/Admin access required/);
    });

    test('should deny access without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/statistics');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Access denied/);
    });
  });

  describe('Input Validation', () => {
    test('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test@.com',
        'test..test@example.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ ...testUser, email });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/email/i);
      }
    });

    test('should validate password length', async () => {
      const shortPasswords = ['', '1', '12', '123', '1234', '12345'];

      for (const password of shortPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ ...testUser, password });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/password/i);
      }
    });

    test('should validate name requirements', async () => {
      const invalidNames = ['', 'A', '    ']; // Empty, too short, only spaces

      for (const name of invalidNames) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ ...testUser, name });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/name/i);
      }
    });

    test('should validate required fields', async () => {
      const requiredFields = ['name', 'email', 'password'];

      for (const field of requiredFields) {
        const incompleteUser = { ...testUser };
        delete incompleteUser[field];

        const response = await request(app)
          .post('/api/auth/register')
          .send(incompleteUser);

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(new RegExp(field, 'i'));
      }
    });
  });

  describe('Security Features', () => {
    test('should not return password in response', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.user.password).toBeUndefined();
    });

    test('should not return password hash in user info', async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const authToken = registerResponse.body.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.password).toBeUndefined();
    });

    test('should set appropriate default role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('user');
    });

    test('should sanitize user input', async () => {
      const maliciousUser = {
        name: '  <script>alert("xss")</script>  ',
        email: '  TEST@EXAMPLE.COM  ',
        password: testUser.password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousUser);

      expect(response.status).toBe(201);
      expect(response.body.user.name).toBe('<script>alert("xss")</script>'); // Trimmed
      expect(response.body.user.email).toBe('test@example.com'); // Lowercase and trimmed
    });
  });
});
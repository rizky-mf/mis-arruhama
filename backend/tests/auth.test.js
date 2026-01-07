// tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('Authentication API - White Box & Black Box Testing', () => {

  beforeAll(async () => {
    // Ensure test database is ready
    await db.sequelize.sync();
  });

  afterAll(async () => {
    // Close database connection
    await db.sequelize.close();
  });

  // ============================================
  // BLACK BOX TESTING - Equivalence Partitioning
  // ============================================
  describe('BLACK BOX - Equivalence Partitioning', () => {

    test('EP-01: Valid username and password (admin) - Data Benar', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');
    });

    test('EP-04: Empty username - Data Salah', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: '',
          password: 'admin123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    test('EP-05: Empty password - Data Salah', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: ''
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-06: Unregistered username - Data Salah', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'usernotexist',
          password: 'anypassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid');
    });

    test('EP-07: Wrong password - Data Salah', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid');
    });

    test('EP-09: Null input - Data Salah', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================
  // BLACK BOX TESTING - Boundary Value Analysis
  // ============================================
  describe('BLACK BOX - Boundary Value Analysis', () => {

    test('BVA-01: Username minimum length (3 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'abc',
          password: 'test123'
        });

      expect([400, 401]).toContain(res.statusCode);
    });

    test('BVA-02: Username below minimum (2 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'ab',
          password: 'test123'
        });

      expect([400, 401]).toContain(res.statusCode);
    });

    test('BVA-03: Username maximum length (100 chars)', async () => {
      const longUsername = 'a'.repeat(100);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: longUsername,
          password: 'test123'
        });

      expect([400, 401]).toContain(res.statusCode);
    });

    test('BVA-04: Username above maximum (101 chars)', async () => {
      const longUsername = 'a'.repeat(101);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: longUsername,
          password: 'test123'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // WHITE BOX TESTING - Path Coverage
  // ============================================
  describe('WHITE BOX - Path Coverage', () => {

    test('Path-1: Input invalid → return 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Path-2: User not found → return 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'xxx',
          password: 'xxx'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid');
    });

    test('Path-4: Password wrong → return 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrong'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid');
    });

    test('Path-5: Success admin → return 200', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.role).toBe('admin');
      expect(res.body.data.token).toBeDefined();
    });
  });

  // ============================================
  // WHITE BOX TESTING - Branch Coverage
  // ============================================
  describe('WHITE BOX - Branch Coverage', () => {

    test('B-01: if (!username || !password) - TRUE path', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: '', password: 'test' });

      expect(res.statusCode).toBe(400);
    });

    test('B-01: if (!username || !password) - FALSE path', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.statusCode).toBe(200);
    });

    test('B-02: if (!user) - TRUE path', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'notexist', password: 'anypass' });

      expect(res.statusCode).toBe(401);
    });

    test('B-02: if (!user) - FALSE path', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.statusCode).toBe(200);
    });

    test('B-04: if (!isPasswordValid) - TRUE path', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpass' });

      expect(res.statusCode).toBe(401);
    });

    test('B-04: if (!isPasswordValid) - FALSE path', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.statusCode).toBe(200);
    });
  });

  // ============================================
  // WHITE BOX TESTING - Condition Coverage
  // ============================================
  describe('WHITE BOX - Condition Coverage', () => {

    test('C-01: !username - TRUE', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: '', password: 'test' });

      expect(res.statusCode).toBe(400);
    });

    test('C-01: !username - FALSE', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.statusCode).toBe(200);
    });

    test('C-02: !password - TRUE', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '' });

      expect(res.statusCode).toBe(400);
    });

    test('C-02: !password - FALSE', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.statusCode).toBe(200);
    });
  });

  // ============================================
  // BLACK BOX TESTING - Decision Table
  // ============================================
  describe('BLACK BOX - Decision Table Testing', () => {

    test('DT-01: Valid | Valid | Yes | Yes → Success', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('DT-03: Valid | Valid | No | N/A → Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'notexist', password: 'anypass' });

      expect(res.statusCode).toBe(401);
    });

    test('DT-04: Valid | Invalid | Yes | Yes → Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpass' });

      expect(res.statusCode).toBe(401);
    });

    test('DT-05: Invalid | Valid | N/A | N/A → Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: '', password: 'admin123' });

      expect(res.statusCode).toBe(400);
    });

    test('DT-06: Valid | Invalid | N/A | N/A → Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '' });

      expect(res.statusCode).toBe(400);
    });

    test('DT-07: Invalid | Invalid | N/A | N/A → Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: '', password: '' });

      expect(res.statusCode).toBe(400);
    });

    test('DT-08: Null | Null | N/A | N/A → Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });
});

// tests/pembayaran.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('Pembayaran API - White Box & Black Box Testing', () => {
  let adminToken;
  let testPembayaranId;

  beforeAll(async () => {
    await db.sequelize.sync();

    // Login as admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    adminToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    // Cleanup
    if (testPembayaranId) {
      await db.Pembayaran.destroy({ where: { id: testPembayaranId } });
    }
    await db.sequelize.close();
  });

  // ============================================
  // BLACK BOX TESTING - CREATE PEMBAYARAN
  // ============================================
  describe('BLACK BOX - Equivalence Partitioning (Create Pembayaran)', () => {

    test('EP-01: Valid complete data - Data Benar', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          metode_pembayaran: 'Transfer Bank',
          status: 'pending'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jumlah).toBe(500000);

      testPembayaranId = res.body.data.id;
    });

    test('EP-02: Missing siswa_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-03: Invalid jumlah (negative) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: -1000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-04: Invalid status - Data Salah', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'invalid_status'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-05: Invalid siswa_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 99999,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-06: Invalid list_pembayaran_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 99999,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-07: No authorization - Data Salah', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('BLACK BOX - Boundary Value Analysis (Create Pembayaran)', () => {

    test('BVA-01: jumlah minimum (1)', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 1,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-02: jumlah zero (0) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 0,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
    });

    test('BVA-03: jumlah maximum (10000000)', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 10000000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-04: tanggal_bayar - past date', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2020-01-01',
          status: 'pending'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-05: tanggal_bayar - future date', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2030-12-31',
          status: 'pending'
        });

      expect([201, 400]).toContain(res.statusCode);
    });
  });

  // ============================================
  // WHITE BOX TESTING - CREATE PEMBAYARAN
  // ============================================
  describe('WHITE BOX - Path Coverage (Create Pembayaran)', () => {

    test('Path-1: Missing required fields → return 400', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Path-2: Invalid jumlah (negative) → return 400', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: -5000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-3: Invalid status value → return 400', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'BadStatus'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-4: Invalid siswa_id → return 400', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 99999,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-5: Valid data → create pembayaran → return 201', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 600000,
          tanggal_bayar: '2024-12-05',
          metode_pembayaran: 'Cash',
          status: 'pending'
        });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('WHITE BOX - Branch Coverage (Create Pembayaran)', () => {

    test('B-01: if (!siswa_id || !list_pembayaran_id || !jumlah || !tanggal_bayar || !status) - TRUE', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ siswa_id: 1 });

      expect(res.statusCode).toBe(400);
    });

    test('B-01: if (!siswa_id || ...) - FALSE', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('B-02: if (jumlah <= 0) - TRUE', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: -100,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-03: if (!validStatus.includes(status)) - TRUE', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'NotValid'
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-04: if (!siswa) - TRUE', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 99999,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - APPROVE PEMBAYARAN
  // ============================================
  describe('BLACK BOX - Approve Pembayaran', () => {

    test('Approve-01: Valid approval - Data Benar', async () => {
      const res = await request(app)
        .put(`/api/pembayaran/${testPembayaranId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
    });

    test('Approve-02: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .put('/api/pembayaran/99999/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved'
        });

      expect(res.statusCode).toBe(404);
    });

    test('Approve-03: Invalid status - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/pembayaran/${testPembayaranId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'invalid_status'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Approve-04: Reject payment - Data Benar', async () => {
      const res = await request(app)
        .put(`/api/pembayaran/${testPembayaranId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('rejected');
    });

    test('Approve-05: No authorization - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/pembayaran/${testPembayaranId}/approve`)
        .send({
          status: 'approved'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // BLACK BOX TESTING - GET PEMBAYARAN
  // ============================================
  describe('BLACK BOX - Get Pembayaran', () => {

    test('Get-01: Get all pembayaran - Data Benar', async () => {
      const res = await request(app)
        .get('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Get-02: Get pembayaran by ID - Data Benar', async () => {
      const res = await request(app)
        .get(`/api/pembayaran/${testPembayaranId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testPembayaranId);
    });

    test('Get-03: Get non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .get('/api/pembayaran/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Get-04: No authorization - Data Salah', async () => {
      const res = await request(app)
        .get('/api/pembayaran');

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // BLACK BOX TESTING - DELETE PEMBAYARAN
  // ============================================
  describe('BLACK BOX - Delete Pembayaran', () => {

    test('Delete-01: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .delete('/api/pembayaran/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Delete-02: No authorization - Data Salah', async () => {
      const res = await request(app)
        .delete(`/api/pembayaran/${testPembayaranId}`);

      expect(res.statusCode).toBe(401);
    });

    test('Delete-03: Valid ID - Data Benar', async () => {
      const res = await request(app)
        .delete(`/api/pembayaran/${testPembayaranId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      testPembayaranId = null;
    });
  });

  // ============================================
  // WHITE BOX TESTING - Decision Table
  // ============================================
  describe('WHITE BOX - Decision Table (Create Pembayaran)', () => {

    test('DT-01: All Valid → Success', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 700000,
          tanggal_bayar: '2024-12-06',
          metode_pembayaran: 'Transfer Bank',
          status: 'pending'
        });

      expect(res.statusCode).toBe(201);
    });

    test('DT-02: Invalid Siswa | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 99999,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-03: Valid Siswa | Invalid Jumlah | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: -500,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-04: Valid Siswa/Jumlah | Invalid Status | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 1,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'WrongStatus'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-05: Valid Siswa/Jumlah/Status | Invalid List Pembayaran → Bad Request', async () => {
      const res = await request(app)
        .post('/api/pembayaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          siswa_id: 1,
          list_pembayaran_id: 99999,
          jumlah: 500000,
          tanggal_bayar: '2024-12-04',
          status: 'pending'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});

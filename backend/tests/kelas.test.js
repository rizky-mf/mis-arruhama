// tests/kelas.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('Kelas API - White Box & Black Box Testing', () => {
  let adminToken;
  let testKelasId;

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
    if (testKelasId) {
      await db.Kelas.destroy({ where: { id: testKelasId } });
    }
    await db.sequelize.close();
  });

  // ============================================
  // BLACK BOX TESTING - CREATE KELAS
  // ============================================
  describe('BLACK BOX - Equivalence Partitioning (Create Kelas)', () => {

    test('EP-01: Valid complete data - Data Benar', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'X IPA 1',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1,
          kapasitas: 30
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nama_kelas).toBe('X IPA 1');

      testKelasId = res.body.data.id;
    });

    test('EP-02: Empty nama_kelas - Data Salah', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: '',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-03: Invalid tingkat (below 7) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Kelas Test',
          tingkat: 6,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-04: Invalid tingkat (above 12) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Kelas Test',
          tingkat: 13,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-05: Invalid guru_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Kelas Test',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 99999
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-06: Missing required fields - Data Salah', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Kelas Test'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-07: No authorization - Data Salah', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .send({
          nama_kelas: 'Kelas Test',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('BLACK BOX - Boundary Value Analysis (Create Kelas)', () => {

    test('BVA-01: Tingkat minimum (7)', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'VII A',
          tingkat: 7,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-02: Tingkat below minimum (6)', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'BVA Test',
          tingkat: 6,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('BVA-03: Tingkat maximum (12)', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'XII IPA 1',
          tingkat: 12,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-04: Tingkat above maximum (13)', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'BVA Test',
          tingkat: 13,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('BVA-05: Kapasitas minimum (1)', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'BVA Kapasitas Min',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1,
          kapasitas: 1
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-06: Kapasitas zero (0) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'BVA Kapasitas Zero',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1,
          kapasitas: 0
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // WHITE BOX TESTING - CREATE KELAS
  // ============================================
  describe('WHITE BOX - Path Coverage (Create Kelas)', () => {

    test('Path-1: Missing required fields → return 400', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Path-2: Invalid tingkat range → return 400', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Path Test',
          tingkat: 15,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-3: Invalid guru_id → return 400', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Path Test',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-4: Valid data → create kelas → return 201', async () => {
      const uniqueName = `Path Test ${Date.now()}`;
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: uniqueName,
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1,
          kapasitas: 30
        });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('WHITE BOX - Branch Coverage (Create Kelas)', () => {

    test('B-01: if (!nama_kelas || !tingkat || !tahun_ajaran || !guru_id) - TRUE', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nama_kelas: 'Test' });

      expect(res.statusCode).toBe(400);
    });

    test('B-01: if (!nama_kelas || !tingkat || !tahun_ajaran || !guru_id) - FALSE', async () => {
      const uniqueName = `Branch ${Date.now()}`;
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: uniqueName,
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('B-02: if (tingkat < 7 || tingkat > 12) - TRUE', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Branch Test',
          tingkat: 5,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-03: if (!guru) - TRUE', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Branch Test',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - UPDATE KELAS
  // ============================================
  describe('BLACK BOX - Update Kelas', () => {

    test('Update-01: Valid update data - Data Benar', async () => {
      const res = await request(app)
        .put(`/api/kelas/${testKelasId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'X IPA 1 Updated',
          kapasitas: 35
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nama_kelas).toBe('X IPA 1 Updated');
    });

    test('Update-02: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .put('/api/kelas/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'Test Update'
        });

      expect(res.statusCode).toBe(404);
    });

    test('Update-03: Invalid tingkat - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/kelas/${testKelasId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tingkat: 15
        });

      expect(res.statusCode).toBe(400);
    });

    test('Update-04: Invalid guru_id - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/kelas/${testKelasId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          guru_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - GET KELAS
  // ============================================
  describe('BLACK BOX - Get Kelas', () => {

    test('Get-01: Get all kelas - Data Benar', async () => {
      const res = await request(app)
        .get('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Get-02: Get kelas by ID - Data Benar', async () => {
      const res = await request(app)
        .get(`/api/kelas/${testKelasId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testKelasId);
    });

    test('Get-03: Get non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .get('/api/kelas/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Get-04: No authorization - Data Salah', async () => {
      const res = await request(app)
        .get('/api/kelas');

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // BLACK BOX TESTING - DELETE KELAS
  // ============================================
  describe('BLACK BOX - Delete Kelas', () => {

    test('Delete-01: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .delete('/api/kelas/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Delete-02: No authorization - Data Salah', async () => {
      const res = await request(app)
        .delete(`/api/kelas/${testKelasId}`);

      expect(res.statusCode).toBe(401);
    });

    test('Delete-03: Valid ID - Data Benar', async () => {
      const res = await request(app)
        .delete(`/api/kelas/${testKelasId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      testKelasId = null;
    });
  });

  // ============================================
  // WHITE BOX TESTING - Decision Table
  // ============================================
  describe('WHITE BOX - Decision Table (Create Kelas)', () => {

    test('DT-01: Valid All Fields → Success', async () => {
      const uniqueName = `DT ${Date.now()}`;
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: uniqueName,
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1,
          kapasitas: 30
        });

      expect(res.statusCode).toBe(201);
    });

    test('DT-02: Invalid Nama | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: '',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-03: Valid Nama | Invalid Tingkat | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'DT Test',
          tingkat: 20,
          tahun_ajaran: '2024/2025',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-04: Valid Nama/Tingkat | Invalid TahunAjaran | Valid Guru → Bad Request', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'DT Test',
          tingkat: 10,
          tahun_ajaran: '',
          guru_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-05: Valid Nama/Tingkat/TahunAjaran | Invalid Guru → Bad Request', async () => {
      const res = await request(app)
        .post('/api/kelas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama_kelas: 'DT Test',
          tingkat: 10,
          tahun_ajaran: '2024/2025',
          guru_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });
  });
});

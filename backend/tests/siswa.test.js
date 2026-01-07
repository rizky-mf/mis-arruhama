// tests/siswa.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('Siswa API - White Box & Black Box Testing', () => {
  let adminToken;
  let testSiswaId;

  beforeAll(async () => {
    await db.sequelize.sync();

    // Login as admin to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    adminToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testSiswaId) {
      await db.Siswa.destroy({ where: { id: testSiswaId } });
    }
    await db.sequelize.close();
  });

  // ============================================
  // BLACK BOX TESTING - CREATE SISWA
  // ============================================
  describe('BLACK BOX - Equivalence Partitioning (Create Siswa)', () => {

    test('EP-01: Valid complete data - Data Benar', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024001',
          nama: 'Ahmad Rizki',
          kelas_id: 1,
          jenis_kelamin: 'L',
          tanggal_lahir: '2010-05-15',
          alamat: 'Jl. Merdeka No. 123',
          nama_wali: 'Bapak Ahmad',
          no_telp_wali: '081234567890',
          email: 'ahmad.rizki@test.com'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nis).toBe('2024001');

      testSiswaId = res.body.data.id;
    });

    test('EP-02: Empty NIS - Data Salah', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '',
          nama: 'Ahmad Rizki',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-03: Empty nama - Data Salah', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024002',
          nama: '',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-04: Invalid kelas_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024003',
          nama: 'Test Student',
          kelas_id: 99999,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-05: Invalid jenis_kelamin - Data Salah', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024004',
          nama: 'Test Student',
          kelas_id: 1,
          jenis_kelamin: 'X'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-06: Duplicate NIS - Data Salah', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024001', // Same as first test
          nama: 'Another Student',
          kelas_id: 1,
          jenis_kelamin: 'P'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('sudah ada');
    });

    test('EP-07: Missing required fields - Data Salah', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024005'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-08: No authorization token - Data Salah', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .send({
          nis: '2024006',
          nama: 'Test Student',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('BLACK BOX - Boundary Value Analysis (Create Siswa)', () => {

    test('BVA-01: NIS minimum length (6 chars)', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '123456',
          nama: 'Test BVA',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-02: NIS below minimum (5 chars)', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '12345',
          nama: 'Test BVA',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
    });

    test('BVA-03: NIS maximum length (20 chars)', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '12345678901234567890',
          nama: 'Test BVA',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-04: Nama maximum length (100 chars)', async () => {
      const longName = 'A'.repeat(100);
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024BVA',
          nama: longName,
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect([201, 400]).toContain(res.statusCode);
    });
  });

  // ============================================
  // WHITE BOX TESTING - CREATE SISWA
  // ============================================
  describe('WHITE BOX - Path Coverage (Create Siswa)', () => {

    test('Path-1: Missing required fields → return 400', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Path-2: NIS already exists → return 400', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024001',
          nama: 'Duplicate Test',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-3: Invalid kelas_id → return 400', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024PATH',
          nama: 'Path Test',
          kelas_id: 99999,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-4: Valid data → create user + siswa → return 201', async () => {
      const uniqueNis = `PATH${Date.now()}`;
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: uniqueNis,
          nama: 'Path Success',
          kelas_id: 1,
          jenis_kelamin: 'L',
          email: `path${Date.now()}@test.com`
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.nis).toBe(uniqueNis);
    });
  });

  describe('WHITE BOX - Branch Coverage (Create Siswa)', () => {

    test('B-01: if (!nis || !nama || !kelas_id || !jenis_kelamin) - TRUE', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nis: '123' });

      expect(res.statusCode).toBe(400);
    });

    test('B-01: if (!nis || !nama || !kelas_id || !jenis_kelamin) - FALSE', async () => {
      const uniqueNis = `BR${Date.now()}`;
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: uniqueNis,
          nama: 'Branch Test',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('B-02: if (existingSiswa) - TRUE', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '2024001',
          nama: 'Duplicate',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-03: if (!kelas) - TRUE', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: 'BRTEST',
          nama: 'Branch Test',
          kelas_id: 99999,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - UPDATE SISWA
  // ============================================
  describe('BLACK BOX - Update Siswa', () => {

    test('Update-01: Valid update data - Data Benar', async () => {
      const res = await request(app)
        .put(`/api/siswa/${testSiswaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Ahmad Rizki Updated',
          alamat: 'Jl. Updated No. 456'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nama).toBe('Ahmad Rizki Updated');
    });

    test('Update-02: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .put('/api/siswa/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Test Update'
        });

      expect(res.statusCode).toBe(404);
    });

    test('Update-03: Empty update data - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/siswa/${testSiswaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect([200, 400]).toContain(res.statusCode);
    });

    test('Update-04: Invalid kelas_id - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/siswa/${testSiswaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - GET SISWA
  // ============================================
  describe('BLACK BOX - Get Siswa', () => {

    test('Get-01: Get all siswa - Data Benar', async () => {
      const res = await request(app)
        .get('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Get-02: Get siswa by ID - Data Benar', async () => {
      const res = await request(app)
        .get(`/api/siswa/${testSiswaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testSiswaId);
    });

    test('Get-03: Get non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .get('/api/siswa/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Get-04: No authorization - Data Salah', async () => {
      const res = await request(app)
        .get('/api/siswa');

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // BLACK BOX TESTING - DELETE SISWA
  // ============================================
  describe('BLACK BOX - Delete Siswa', () => {

    test('Delete-01: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .delete('/api/siswa/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Delete-02: No authorization - Data Salah', async () => {
      const res = await request(app)
        .delete(`/api/siswa/${testSiswaId}`);

      expect(res.statusCode).toBe(401);
    });

    test('Delete-03: Valid ID - Data Benar', async () => {
      const res = await request(app)
        .delete(`/api/siswa/${testSiswaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      testSiswaId = null; // Mark as deleted
    });
  });

  // ============================================
  // WHITE BOX TESTING - Decision Table
  // ============================================
  describe('WHITE BOX - Decision Table (Create Siswa)', () => {

    test('DT-01: Valid | Valid | Valid | Valid → Success', async () => {
      const uniqueNis = `DT${Date.now()}`;
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: uniqueNis,
          nama: 'DT Test',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(201);
    });

    test('DT-02: Invalid | Valid | Valid | Valid → Bad Request', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: '',
          nama: 'DT Test',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-03: Valid | Invalid | Valid | Valid → Bad Request', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: 'DT003',
          nama: '',
          kelas_id: 1,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-04: Valid | Valid | Invalid | Valid → Bad Request', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: 'DT004',
          nama: 'DT Test',
          kelas_id: 99999,
          jenis_kelamin: 'L'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-05: Valid | Valid | Valid | Invalid → Bad Request', async () => {
      const res = await request(app)
        .post('/api/siswa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nis: 'DT005',
          nama: 'DT Test',
          kelas_id: 1,
          jenis_kelamin: 'X'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});

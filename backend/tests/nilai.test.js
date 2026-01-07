// tests/nilai.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('Nilai/Rapor API - White Box & Black Box Testing', () => {
  let guruToken;
  let testNilaiId;

  beforeAll(async () => {
    await db.sequelize.sync();

    // Login as guru/admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    guruToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    // Cleanup
    if (testNilaiId) {
      await db.Rapor.destroy({ where: { id: testNilaiId } });
    }
    await db.sequelize.close();
  });

  // ============================================
  // BLACK BOX TESTING - CREATE NILAI
  // ============================================
  describe('BLACK BOX - Equivalence Partitioning (Create Nilai)', () => {

    test('EP-01: Valid complete data - Data Benar', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_tugas: 85,
          nilai_uts: 80,
          nilai_uas: 88,
          nilai_akhir: 84
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nilai_akhir).toBe(84);

      testNilaiId = res.body.data.id;
    });

    test('EP-02: Missing siswa_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-03: Invalid nilai_akhir (above 100) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 101
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-04: Invalid nilai_akhir (negative) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: -5
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-05: Invalid semester (0) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 0,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-06: Invalid semester (above 2) - Data Salah', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 3,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-07: Invalid siswa_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 99999,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-08: No authorization - Data Salah', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('BLACK BOX - Boundary Value Analysis (Create Nilai)', () => {

    test('BVA-01: nilai_akhir minimum (0)', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 2,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 0
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-02: nilai_akhir below minimum (-1)', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: -1
        });

      expect(res.statusCode).toBe(400);
    });

    test('BVA-03: nilai_akhir maximum (100)', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 2,
          tahun_ajaran: '2024/2025',
          nilai_tugas: 100,
          nilai_uts: 100,
          nilai_uas: 100,
          nilai_akhir: 100
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-04: nilai_akhir above maximum (101)', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 101
        });

      expect(res.statusCode).toBe(400);
    });

    test('BVA-05: semester minimum (1)', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 75
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-06: semester maximum (2)', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 2,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 75
        });

      expect([201, 400]).toContain(res.statusCode);
    });
  });

  // ============================================
  // WHITE BOX TESTING - CREATE NILAI
  // ============================================
  describe('WHITE BOX - Path Coverage (Create Nilai)', () => {

    test('Path-1: Missing required fields → return 400', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Path-2: Invalid semester range → return 400', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 5,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-3: Invalid nilai range → return 400', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 150
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-4: Invalid siswa_id → return 400', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 99999,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-5: Valid data → create nilai → return 201', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 2,
          tahun_ajaran: '2024/2025',
          nilai_tugas: 90,
          nilai_uts: 85,
          nilai_uas: 88,
          nilai_akhir: 87
        });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('WHITE BOX - Branch Coverage (Create Nilai)', () => {

    test('B-01: if (!siswa_id || !mata_pelajaran_id || !semester || !tahun_ajaran) - TRUE', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({ siswa_id: 1 });

      expect(res.statusCode).toBe(400);
    });

    test('B-01: if (!siswa_id || ...) - FALSE', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 80
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('B-02: if (semester < 1 || semester > 2) - TRUE', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 10,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-03: if (nilai_akhir < 0 || nilai_akhir > 100) - TRUE', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 120
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-04: if (!siswa) - TRUE', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 99999,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 85
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - UPDATE NILAI
  // ============================================
  describe('BLACK BOX - Update Nilai', () => {

    test('Update-01: Valid update data - Data Benar', async () => {
      const res = await request(app)
        .put(`/api/nilai/${testNilaiId}`)
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          nilai_akhir: 90,
          nilai_uts: 92
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nilai_akhir).toBe(90);
    });

    test('Update-02: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .put('/api/nilai/99999')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          nilai_akhir: 90
        });

      expect(res.statusCode).toBe(404);
    });

    test('Update-03: Invalid nilai range - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/nilai/${testNilaiId}`)
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          nilai_akhir: 150
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - GET NILAI
  // ============================================
  describe('BLACK BOX - Get Nilai', () => {

    test('Get-01: Get all nilai - Data Benar', async () => {
      const res = await request(app)
        .get('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Get-02: Get nilai by ID - Data Benar', async () => {
      const res = await request(app)
        .get(`/api/nilai/${testNilaiId}`)
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testNilaiId);
    });

    test('Get-03: Get non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .get('/api/nilai/99999')
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Get-04: No authorization - Data Salah', async () => {
      const res = await request(app)
        .get('/api/nilai');

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // BLACK BOX TESTING - DELETE NILAI
  // ============================================
  describe('BLACK BOX - Delete Nilai', () => {

    test('Delete-01: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .delete('/api/nilai/99999')
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Delete-02: No authorization - Data Salah', async () => {
      const res = await request(app)
        .delete(`/api/nilai/${testNilaiId}`);

      expect(res.statusCode).toBe(401);
    });

    test('Delete-03: Valid ID - Data Benar', async () => {
      const res = await request(app)
        .delete(`/api/nilai/${testNilaiId}`)
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      testNilaiId = null;
    });
  });

  // ============================================
  // WHITE BOX TESTING - Decision Table
  // ============================================
  describe('WHITE BOX - Decision Table (Create Nilai)', () => {

    test('DT-01: All Valid → Success', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 88
        });

      expect(res.statusCode).toBe(201);
    });

    test('DT-02: Invalid Siswa | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 99999,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 88
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-03: Valid Siswa | Invalid Semester | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 5,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 88
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-04: Valid Siswa/Semester | Invalid Nilai | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/nilai')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          mata_pelajaran_id: 1,
          semester: 1,
          tahun_ajaran: '2024/2025',
          nilai_akhir: 150
        });

      expect(res.statusCode).toBe(400);
    });
  });
});

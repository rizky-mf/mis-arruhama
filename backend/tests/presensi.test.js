// tests/presensi.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('Presensi API - White Box & Black Box Testing', () => {
  let guruToken;
  let testPresensiId;

  beforeAll(async () => {
    await db.sequelize.sync();

    // Login as guru (assuming guru username exists)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin', // Using admin for testing
        password: 'admin123'
      });

    guruToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    // Cleanup
    if (testPresensiId) {
      await db.Presensi.destroy({ where: { id: testPresensiId } });
    }
    await db.sequelize.close();
  });

  // ============================================
  // BLACK BOX TESTING - CREATE PRESENSI
  // ============================================
  describe('BLACK BOX - Equivalence Partitioning (Create Presensi)', () => {

    test('EP-01: Valid complete data - Data Benar', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'Hadir',
          keterangan: 'Hadir tepat waktu'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Hadir');

      testPresensiId = res.body.data.id;
    });

    test('EP-02: Missing siswa_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-03: Invalid status - Data Salah', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'InvalidStatus'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-04: Invalid date format - Data Salah', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '04-12-2024',
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-05: Invalid siswa_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 99999,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-06: No authorization - Data Salah', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('BLACK BOX - Boundary Value Analysis (Create Presensi)', () => {

    test('BVA-01: tanggal - past date', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2020-01-01',
          status: 'Hadir'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-02: tanggal - future date', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2030-12-31',
          status: 'Hadir'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-03: keterangan maximum length (255 chars)', async () => {
      const longKeterangan = 'A'.repeat(255);
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-05',
          status: 'Sakit',
          keterangan: longKeterangan
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-04: keterangan above maximum (256 chars)', async () => {
      const longKeterangan = 'A'.repeat(256);
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-05',
          status: 'Sakit',
          keterangan: longKeterangan
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // WHITE BOX TESTING - CREATE PRESENSI
  // ============================================
  describe('WHITE BOX - Path Coverage (Create Presensi)', () => {

    test('Path-1: Missing required fields → return 400', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Path-2: Invalid status value → return 400', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'WrongStatus'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-3: Invalid siswa_id → return 400', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 99999,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-4: Valid data → create presensi → return 201', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-06',
          status: 'Izin',
          keterangan: 'Ada keperluan keluarga'
        });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('WHITE BOX - Branch Coverage (Create Presensi)', () => {

    test('B-01: if (!siswa_id || !kelas_id || !mata_pelajaran_id || !tanggal || !status) - TRUE', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({ siswa_id: 1 });

      expect(res.statusCode).toBe(400);
    });

    test('B-01: if (!siswa_id || ...) - FALSE', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-07',
          status: 'Hadir'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('B-02: if (!validStatus.includes(status)) - TRUE', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'BadStatus'
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-03: if (!siswa) - TRUE', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 99999,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - UPDATE PRESENSI
  // ============================================
  describe('BLACK BOX - Update Presensi', () => {

    test('Update-01: Valid update data - Data Benar', async () => {
      const res = await request(app)
        .put(`/api/presensi/${testPresensiId}`)
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          status: 'Sakit',
          keterangan: 'Sakit demam'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Sakit');
    });

    test('Update-02: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .put('/api/presensi/99999')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(404);
    });

    test('Update-03: Invalid status - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/presensi/${testPresensiId}`)
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          status: 'InvalidStatus'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - GET PRESENSI
  // ============================================
  describe('BLACK BOX - Get Presensi', () => {

    test('Get-01: Get all presensi - Data Benar', async () => {
      const res = await request(app)
        .get('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Get-02: Get presensi by ID - Data Benar', async () => {
      const res = await request(app)
        .get(`/api/presensi/${testPresensiId}`)
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testPresensiId);
    });

    test('Get-03: Get non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .get('/api/presensi/99999')
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Get-04: No authorization - Data Salah', async () => {
      const res = await request(app)
        .get('/api/presensi');

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // BLACK BOX TESTING - DELETE PRESENSI
  // ============================================
  describe('BLACK BOX - Delete Presensi', () => {

    test('Delete-01: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .delete('/api/presensi/99999')
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Delete-02: No authorization - Data Salah', async () => {
      const res = await request(app)
        .delete(`/api/presensi/${testPresensiId}`);

      expect(res.statusCode).toBe(401);
    });

    test('Delete-03: Valid ID - Data Benar', async () => {
      const res = await request(app)
        .delete(`/api/presensi/${testPresensiId}`)
        .set('Authorization', `Bearer ${guruToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      testPresensiId = null;
    });
  });

  // ============================================
  // WHITE BOX TESTING - Decision Table
  // ============================================
  describe('WHITE BOX - Decision Table (Create Presensi)', () => {

    test('DT-01: All Valid → Success', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-08',
          status: 'Hadir',
          keterangan: 'OK'
        });

      expect(res.statusCode).toBe(201);
    });

    test('DT-02: Invalid Siswa | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 99999,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-03: Valid Siswa | Invalid Status | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: '2024-12-04',
          status: 'NotValidStatus'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-04: Valid Siswa/Status | Invalid Date | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/presensi')
        .set('Authorization', `Bearer ${guruToken}`)
        .send({
          siswa_id: 1,
          kelas_id: 1,
          mata_pelajaran_id: 1,
          tanggal: 'invalid-date',
          status: 'Hadir'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});

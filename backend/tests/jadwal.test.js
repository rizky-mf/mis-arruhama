// tests/jadwal.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('Jadwal Pelajaran API - White Box & Black Box Testing', () => {
  let adminToken;
  let testJadwalId;

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
    if (testJadwalId) {
      await db.JadwalPelajaran.destroy({ where: { id: testJadwalId } });
    }
    await db.sequelize.close();
  });

  // ============================================
  // BLACK BOX TESTING - CREATE JADWAL
  // ============================================
  describe('BLACK BOX - Equivalence Partitioning (Create Jadwal)', () => {

    test('EP-01: Valid complete data - Data Benar', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30',
          ruangan: 'R101'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hari).toBe('Senin');

      testJadwalId = res.body.data.id;
    });

    test('EP-02: Missing kelas_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-03: Invalid hari - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'InvalidDay',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-04: Invalid jam_mulai format - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '25:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-05: jam_selesai before jam_mulai - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '10:00',
          jam_selesai: '09:00'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('sebelum');
    });

    test('EP-06: Invalid kelas_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 99999,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-07: Invalid mata_pelajaran_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 99999,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-08: Invalid guru_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 99999,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-09: No authorization - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('BLACK BOX - Boundary Value Analysis (Create Jadwal)', () => {

    test('BVA-01: jam_mulai earliest (00:00)', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Selasa',
          jam_mulai: '00:00',
          jam_selesai: '01:30'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-02: jam_selesai latest (23:59)', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Rabu',
          jam_mulai: '22:00',
          jam_selesai: '23:59'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-03: Minimum duration (1 minute)', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Kamis',
          jam_mulai: '08:00',
          jam_selesai: '08:01'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-04: Same jam_mulai and jam_selesai - Data Salah', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Jumat',
          jam_mulai: '08:00',
          jam_selesai: '08:00'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // WHITE BOX TESTING - CREATE JADWAL
  // ============================================
  describe('WHITE BOX - Path Coverage (Create Jadwal)', () => {

    test('Path-1: Missing required fields → return 400', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Path-2: Invalid hari value → return 400', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Sunday',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-3: jam_selesai <= jam_mulai → return 400', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '10:00',
          jam_selesai: '09:00'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-4: Invalid kelas_id → return 400', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 99999,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-5: Valid data → create jadwal → return 201', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Sabtu',
          jam_mulai: '10:00',
          jam_selesai: '11:30',
          ruangan: 'R102'
        });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('WHITE BOX - Branch Coverage (Create Jadwal)', () => {

    test('B-01: if (!kelas_id || !mata_pelajaran_id || !guru_id || !hari || !jam_mulai || !jam_selesai) - TRUE', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ hari: 'Senin' });

      expect(res.statusCode).toBe(400);
    });

    test('B-01: if (!kelas_id || ...) - FALSE', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '13:00',
          jam_selesai: '14:30'
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('B-02: if (!validDays.includes(hari)) - TRUE', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'NotADay',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-03: if (jam_selesai <= jam_mulai) - TRUE', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '10:00',
          jam_selesai: '10:00'
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-04: if (!kelas) - TRUE', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 99999,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - UPDATE JADWAL
  // ============================================
  describe('BLACK BOX - Update Jadwal', () => {

    test('Update-01: Valid update data - Data Benar', async () => {
      const res = await request(app)
        .put(`/api/jadwal-pelajaran/${testJadwalId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          hari: 'Selasa',
          ruangan: 'R201'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hari).toBe('Selasa');
    });

    test('Update-02: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .put('/api/jadwal-pelajaran/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          hari: 'Rabu'
        });

      expect(res.statusCode).toBe(404);
    });

    test('Update-03: Invalid hari - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/jadwal-pelajaran/${testJadwalId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          hari: 'InvalidDay'
        });

      expect(res.statusCode).toBe(400);
    });

    test('Update-04: jam_selesai before jam_mulai - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/jadwal-pelajaran/${testJadwalId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          jam_mulai: '15:00',
          jam_selesai: '14:00'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - GET JADWAL
  // ============================================
  describe('BLACK BOX - Get Jadwal', () => {

    test('Get-01: Get all jadwal - Data Benar', async () => {
      const res = await request(app)
        .get('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Get-02: Get jadwal by ID - Data Benar', async () => {
      const res = await request(app)
        .get(`/api/jadwal-pelajaran/${testJadwalId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testJadwalId);
    });

    test('Get-03: Get non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .get('/api/jadwal-pelajaran/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Get-04: No authorization - Data Salah', async () => {
      const res = await request(app)
        .get('/api/jadwal-pelajaran');

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // BLACK BOX TESTING - DELETE JADWAL
  // ============================================
  describe('BLACK BOX - Delete Jadwal', () => {

    test('Delete-01: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .delete('/api/jadwal-pelajaran/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Delete-02: No authorization - Data Salah', async () => {
      const res = await request(app)
        .delete(`/api/jadwal-pelajaran/${testJadwalId}`);

      expect(res.statusCode).toBe(401);
    });

    test('Delete-03: Valid ID - Data Benar', async () => {
      const res = await request(app)
        .delete(`/api/jadwal-pelajaran/${testJadwalId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      testJadwalId = null;
    });
  });

  // ============================================
  // WHITE BOX TESTING - Decision Table
  // ============================================
  describe('WHITE BOX - Decision Table (Create Jadwal)', () => {

    test('DT-01: All Valid → Success', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '14:00',
          jam_selesai: '15:30',
          ruangan: 'R103'
        });

      expect(res.statusCode).toBe(201);
    });

    test('DT-02: Invalid Kelas | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 99999,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-03: Valid Kelas | Invalid MataPelajaran | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 99999,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-04: Valid Kelas/MataPelajaran | Invalid Guru | Valid Others → Bad Request', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 99999,
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-05: Valid IDs | Invalid Hari | Valid Times → Bad Request', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'NotValid',
          jam_mulai: '08:00',
          jam_selesai: '09:30'
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-06: Valid IDs/Hari | Invalid Time Range → Bad Request', async () => {
      const res = await request(app)
        .post('/api/jadwal-pelajaran')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          kelas_id: 1,
          mata_pelajaran_id: 1,
          guru_id: 1,
          hari: 'Senin',
          jam_mulai: '10:00',
          jam_selesai: '09:00'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});

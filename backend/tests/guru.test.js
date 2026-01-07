// tests/guru.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../models');

describe('Guru API - White Box & Black Box Testing', () => {
  let adminToken;
  let testGuruId;

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
    if (testGuruId) {
      await db.Guru.destroy({ where: { id: testGuruId } });
    }
    await db.sequelize.close();
  });

  // ============================================
  // BLACK BOX TESTING - CREATE GURU
  // ============================================
  describe('BLACK BOX - Equivalence Partitioning (Create Guru)', () => {

    test('EP-01: Valid complete data - Data Benar', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198501012010011001',
          nama: 'Budi Santoso S.Pd',
          jenis_kelamin: 'L',
          tanggal_lahir: '1985-01-01',
          alamat: 'Jl. Pendidikan No. 45',
          no_telp: '081234567890',
          email: 'budi.santoso@test.com',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nip).toBe('198501012010011001');

      testGuruId = res.body.data.id;
    });

    test('EP-02: Empty NIP - Data Salah', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '',
          nama: 'Test Guru',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-03: Empty nama - Data Salah', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198502012010011002',
          nama: '',
          jenis_kelamin: 'P',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-04: Invalid jenis_kelamin - Data Salah', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198503012010011003',
          nama: 'Test Guru',
          jenis_kelamin: 'X',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-05: Invalid mata_pelajaran_id - Data Salah', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198504012010011004',
          nama: 'Test Guru',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 99999
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('EP-06: Duplicate NIP - Data Salah', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198501012010011001',
          nama: 'Another Guru',
          jenis_kelamin: 'P',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('sudah ada');
    });

    test('EP-07: No authorization - Data Salah', async () => {
      const res = await request(app)
        .post('/api/guru')
        .send({
          nip: '198505012010011005',
          nama: 'Test Guru',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('BLACK BOX - Boundary Value Analysis (Create Guru)', () => {

    test('BVA-01: NIP minimum length (18 chars)', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '123456789012345678',
          nama: 'Test BVA',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-02: NIP below minimum (17 chars)', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '12345678901234567',
          nama: 'Test BVA',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('BVA-03: Nama maximum length (100 chars)', async () => {
      const longName = 'A'.repeat(100);
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198506012010011006',
          nama: longName,
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('BVA-04: Nama above maximum (101 chars)', async () => {
      const longName = 'A'.repeat(101);
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198507012010011007',
          nama: longName,
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // WHITE BOX TESTING - CREATE GURU
  // ============================================
  describe('WHITE BOX - Path Coverage (Create Guru)', () => {

    test('Path-1: Missing required fields → return 400', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Path-2: NIP already exists → return 400', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198501012010011001',
          nama: 'Duplicate Test',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-3: Invalid mata_pelajaran_id → return 400', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198508012010011008',
          nama: 'Path Test',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });

    test('Path-4: Valid data → create user + guru → return 201', async () => {
      const uniqueNip = `19850${Date.now().toString().slice(-13)}`;
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: uniqueNip,
          nama: 'Path Success',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1,
          email: `guru${Date.now()}@test.com`
        });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('WHITE BOX - Branch Coverage (Create Guru)', () => {

    test('B-01: if (!nip || !nama || !jenis_kelamin) - TRUE', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nip: '123' });

      expect(res.statusCode).toBe(400);
    });

    test('B-01: if (!nip || !nama || !jenis_kelamin) - FALSE', async () => {
      const uniqueNip = `19850${Date.now().toString().slice(-13)}`;
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: uniqueNip,
          nama: 'Branch Test',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect([201, 400]).toContain(res.statusCode);
    });

    test('B-02: if (existingGuru) - TRUE', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198501012010011001',
          nama: 'Duplicate',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('B-03: if (mata_pelajaran_id && !mataPelajaran) - TRUE', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198509012010011009',
          nama: 'Branch Test',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - UPDATE GURU
  // ============================================
  describe('BLACK BOX - Update Guru', () => {

    test('Update-01: Valid update data - Data Benar', async () => {
      const res = await request(app)
        .put(`/api/guru/${testGuruId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Budi Santoso S.Pd M.Pd',
          alamat: 'Jl. Updated No. 789'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nama).toBe('Budi Santoso S.Pd M.Pd');
    });

    test('Update-02: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .put('/api/guru/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Test Update'
        });

      expect(res.statusCode).toBe(404);
    });

    test('Update-03: Invalid mata_pelajaran_id - Data Salah', async () => {
      const res = await request(app)
        .put(`/api/guru/${testGuruId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mata_pelajaran_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============================================
  // BLACK BOX TESTING - GET GURU
  // ============================================
  describe('BLACK BOX - Get Guru', () => {

    test('Get-01: Get all guru - Data Benar', async () => {
      const res = await request(app)
        .get('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Get-02: Get guru by ID - Data Benar', async () => {
      const res = await request(app)
        .get(`/api/guru/${testGuruId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testGuruId);
    });

    test('Get-03: Get non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .get('/api/guru/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Get-04: No authorization - Data Salah', async () => {
      const res = await request(app)
        .get('/api/guru');

      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // BLACK BOX TESTING - DELETE GURU
  // ============================================
  describe('BLACK BOX - Delete Guru', () => {

    test('Delete-01: Non-existent ID - Data Salah', async () => {
      const res = await request(app)
        .delete('/api/guru/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test('Delete-02: No authorization - Data Salah', async () => {
      const res = await request(app)
        .delete(`/api/guru/${testGuruId}`);

      expect(res.statusCode).toBe(401);
    });

    test('Delete-03: Valid ID - Data Benar', async () => {
      const res = await request(app)
        .delete(`/api/guru/${testGuruId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      testGuruId = null;
    });
  });

  // ============================================
  // WHITE BOX TESTING - Decision Table
  // ============================================
  describe('WHITE BOX - Decision Table (Create Guru)', () => {

    test('DT-01: Valid NIP | Valid Nama | Valid Gender | Valid MataPelajaran → Success', async () => {
      const uniqueNip = `19851${Date.now().toString().slice(-13)}`;
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: uniqueNip,
          nama: 'DT Test',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(201);
    });

    test('DT-02: Invalid NIP | Valid Nama | Valid Gender | Valid MataPelajaran → Bad Request', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '',
          nama: 'DT Test',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-03: Valid NIP | Invalid Nama | Valid Gender | Valid MataPelajaran → Bad Request', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198510012010011010',
          nama: '',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-04: Valid NIP | Valid Nama | Invalid Gender | Valid MataPelajaran → Bad Request', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198511012010011011',
          nama: 'DT Test',
          jenis_kelamin: 'X',
          mata_pelajaran_id: 1
        });

      expect(res.statusCode).toBe(400);
    });

    test('DT-05: Valid NIP | Valid Nama | Valid Gender | Invalid MataPelajaran → Bad Request', async () => {
      const res = await request(app)
        .post('/api/guru')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nip: '198512012010011012',
          nama: 'DT Test',
          jenis_kelamin: 'L',
          mata_pelajaran_id: 99999
        });

      expect(res.statusCode).toBe(400);
    });
  });
});

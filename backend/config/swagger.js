const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MIS AR RUHAMA API Documentation',
    version: '1.0.0',
    description: 'API Documentation untuk Sistem Informasi Manajemen Madrasah Ibtidaiyah Swasta AR RUHAMA',
    contact: {
      name: 'MIS AR RUHAMA',
      email: 'admin@misarruhama.sch.id'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server'
    },
    {
      url: 'https://api.misarruhama.sch.id',
      description: 'Production Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in format: Bearer <token>'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            example: 'admin'
          },
          password: {
            type: 'string',
            example: 'password123'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Login berhasil'
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              username: { type: 'string', example: 'admin' },
              role: { type: 'string', example: 'admin' },
              nama: { type: 'string', example: 'Administrator' }
            }
          }
        }
      },
      Siswa: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nisn: { type: 'string', example: '1234567890' },
          nama_lengkap: { type: 'string', example: 'Ahmad Fauzi' },
          jenis_kelamin: { type: 'string', enum: ['L', 'P'], example: 'L' },
          tanggal_lahir: { type: 'string', format: 'date', example: '2010-05-15' },
          alamat: { type: 'string', example: 'Jl. Contoh No. 123' },
          telepon: { type: 'string', example: '081234567890' },
          email: { type: 'string', example: 'ahmad@example.com' },
          kelas_id: { type: 'integer', example: 1 },
          status: { type: 'string', enum: ['aktif', 'lulus', 'pindah', 'keluar'], example: 'aktif' }
        }
      },
      Guru: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nip: { type: 'string', example: '198001012010011001' },
          nama_lengkap: { type: 'string', example: 'Dr. Budi Santoso, M.Pd' },
          jenis_kelamin: { type: 'string', enum: ['L', 'P'], example: 'L' },
          tanggal_lahir: { type: 'string', format: 'date', example: '1980-01-01' },
          alamat: { type: 'string' },
          telepon: { type: 'string' },
          email: { type: 'string' },
          status: { type: 'string', enum: ['aktif', 'nonaktif'], example: 'aktif' }
        }
      },
      Kelas: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama_kelas: { type: 'string', example: '1A' },
          tingkat: { type: 'integer', example: 1 },
          tahun_ajaran: { type: 'string', example: '2024/2025' },
          wali_kelas_id: { type: 'integer', example: 1 }
        }
      },
      MataPelajaran: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          kode_mapel: { type: 'string', example: 'MTK' },
          nama_mapel: { type: 'string', example: 'Matematika' },
          kkm: { type: 'integer', example: 70 }
        }
      },
      Rapor: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          siswa_id: { type: 'integer', example: 1 },
          kelas_id: { type: 'integer', example: 1 },
          mata_pelajaran_id: { type: 'integer', example: 1 },
          semester: { type: 'string', example: 'Ganjil' },
          tahun_ajaran: { type: 'string', example: '2024/2025' },
          nilai_harian: { type: 'number', format: 'float', example: 80 },
          nilai_uts: { type: 'number', format: 'float', example: 85 },
          nilai_uas: { type: 'number', format: 'float', example: 90 },
          nilai_akhir: { type: 'number', format: 'float', example: 85 },
          predikat: { type: 'string', example: 'B' },
          catatan: { type: 'string', example: 'Sangat baik' }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints untuk autentikasi (login, register, dll)'
    },
    {
      name: 'Admin',
      description: 'Endpoints khusus untuk administrator'
    },
    {
      name: 'Guru',
      description: 'Endpoints khusus untuk guru'
    },
    {
      name: 'Siswa',
      description: 'Endpoints khusus untuk siswa'
    },
    {
      name: 'Kelas',
      description: 'Manajemen data kelas'
    },
    {
      name: 'Mata Pelajaran',
      description: 'Manajemen data mata pelajaran'
    },
    {
      name: 'Rapor',
      description: 'Manajemen data rapor dan nilai siswa'
    },
    {
      name: 'Settings',
      description: 'Pengaturan sistem'
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

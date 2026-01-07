// tests/setup.js
// Global test setup

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_123456789';
process.env.JWT_EXPIRES_IN = '24h';

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log
  error: jest.fn(), // Mock console.error
  warn: jest.fn(), // Mock console.warn
  info: jest.fn(), // Mock console.info
};

// Suppress deprecation warnings
process.env.NODE_NO_WARNINGS = '1';

console.log('Test environment initialized');

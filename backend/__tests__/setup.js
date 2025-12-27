// Test Setup and Configuration
// This file runs before all tests

// Global test utilities
global.testUtils = {
  // Generate random email for testing
  randomEmail: () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,

  // Generate random string
  randomString: (length = 10) => Math.random().toString(36).slice(2, 2 + length),

  // Wait helper
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock JWT token
  mockToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3MDM1OTM2MDB9.test'
};

// Environment configuration for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.PORT = '8081'; // Use different port for tests

// Suppress console logs during tests (optional)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
  };
}

console.log('Test environment initialized');

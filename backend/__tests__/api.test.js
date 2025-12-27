// API Endpoint Tests - Comprehensive testing of all backend routes
import { jest } from '@jest/globals';

// Mock the postgres module before importing server
const mockSql = jest.fn();
mockSql.end = jest.fn();

jest.unstable_mockModule('postgres', () => ({
  default: () => mockSql
}));

// Mock Google Cloud Storage
jest.unstable_mockModule('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({
    bucket: jest.fn().mockReturnValue({
      file: jest.fn().mockReturnValue({
        download: jest.fn().mockResolvedValue([Buffer.from('file content')]),
        save: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined)
      }),
      getFiles: jest.fn().mockResolvedValue([[]])
    })
  }))
}));

// Import after mocking
const request = (await import('supertest')).default;
const app = (await import('../server.js')).default;

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // Health & Status Endpoints
  // ========================================
  describe('Health & Status', () => {
    test('GET /health - should return health status', async () => {
      mockSql.mockResolvedValueOnce([{ '?column?': 1 }]);

      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });

    test('GET /api/status - should return server status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('server', 'running');
      expect(response.body.data).toHaveProperty('database', 'neon-postgresql');
      expect(response.body.data).toHaveProperty('storage', 'google-cloud-storage');
      expect(response.body.data).toHaveProperty('region');
      expect(response.body.data).toHaveProperty('uptime');
    });
  });

  // ========================================
  // Authentication Endpoints
  // ========================================
  describe('Authentication', () => {
    test('POST /api/auth/register - should register new user', async () => {
      const mockUser = {
        id: 'test-uuid',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock: check existing user (none found)
      mockSql.mockResolvedValueOnce([]);
      // Mock: insert user
      mockSql.mockResolvedValueOnce([mockUser]);
      // Mock: create default session
      mockSql.mockResolvedValueOnce([{ id: 'session-uuid' }]);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    test('POST /api/auth/register - should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/auth/register - should fail for existing user', async () => {
      mockSql.mockResolvedValueOnce([{ id: 'existing-user' }]);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_EXISTS');
    });

    test('POST /api/auth/login - should login with valid credentials', async () => {
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default;
      const hashedPassword = await bcrypt.hash('password123', 12);

      mockSql.mockResolvedValueOnce([{
        id: 'user-uuid',
        email: 'test@example.com',
        password_hash: hashedPassword,
        name: 'Test User'
      }]);
      mockSql.mockResolvedValueOnce([]); // Update last_login

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
    });

    test('POST /api/auth/login - should fail with invalid credentials', async () => {
      mockSql.mockResolvedValueOnce([]); // No user found

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('POST /api/auth/verify - should fail without token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  // ========================================
  // File Operations Endpoints
  // ========================================
  describe('File Operations', () => {
    let authToken;

    beforeAll(async () => {
      const jwt = await import('jsonwebtoken');
      authToken = jwt.default.sign(
        { userId: 'test-user-id', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('GET /api/files - should list files with auth', async () => {
      mockSql.mockResolvedValueOnce([{ id: 'session-1' }]); // Get session
      mockSql.mockResolvedValueOnce([
        { path: '/workspace/file1.ts', name: 'file1.ts', type: 'file' },
        { path: '/workspace/file2.ts', name: 'file2.ts', type: 'file' }
      ]);

      const response = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('files');
      expect(Array.isArray(response.body.data.files)).toBe(true);
    });

    test('GET /api/files - should fail without auth', async () => {
      const response = await request(app)
        .get('/api/files')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    test('POST /api/files/write - should write file', async () => {
      mockSql.mockResolvedValueOnce([{ id: 'session-1' }]); // Get session
      mockSql.mockResolvedValueOnce([]); // Upsert file

      const response = await request(app)
        .post('/api/files/write')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/workspace/test.ts',
          content: 'console.log("test");'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('saved', true);
    });

    test('GET /api/files/tree - should return file tree', async () => {
      mockSql.mockResolvedValueOnce([{ id: 'session-1' }]);
      mockSql.mockResolvedValueOnce([
        { path: '/workspace/src/index.ts', name: 'index.ts', type: 'file', language: 'typescript' }
      ]);

      const response = await request(app)
        .get('/api/files/tree')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tree');
      expect(response.body.data.tree).toHaveProperty('name', 'workspace');
      expect(response.body.data.tree).toHaveProperty('type', 'folder');
    });
  });

  // ========================================
  // Terminal Endpoints
  // ========================================
  describe('Terminal Service', () => {
    let authToken;

    beforeAll(async () => {
      const jwt = await import('jsonwebtoken');
      authToken = jwt.default.sign(
        { userId: 'test-user-id', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('POST /api/terminal/execute - should execute command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'pwd' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('command', 'pwd');
      expect(response.body.data).toHaveProperty('output');
      expect(response.body.data).toHaveProperty('exitCode', 0);
    });

    test('POST /api/terminal/execute - should handle ls command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'ls' })
        .expect(200);

      expect(response.body.data.output).toContain('package.json');
    });

    test('POST /api/terminal/execute - should handle node --version', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'node --version' })
        .expect(200);

      expect(response.body.data.output).toContain('v20');
    });

    test('POST /api/terminal/execute - should handle echo command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'echo Hello World' })
        .expect(200);

      expect(response.body.data.output).toBe('Hello World');
    });

    test('POST /api/terminal/execute - should fail without command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ========================================
  // Session Endpoints
  // ========================================
  describe('IDE Sessions', () => {
    let authToken;

    beforeAll(async () => {
      const jwt = await import('jsonwebtoken');
      authToken = jwt.default.sign(
        { userId: 'test-user-id', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('GET /api/sessions - should list sessions', async () => {
      mockSql.mockResolvedValueOnce([
        { id: 'session-1', name: 'Workspace 1', status: 'running' }
      ]);

      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sessions');
    });

    test('POST /api/sessions - should create session', async () => {
      mockSql.mockResolvedValueOnce([{
        id: 'new-session-id',
        name: 'New Workspace',
        status: 'running',
        region: 'australia-southeast1'
      }]);
      mockSql.mockResolvedValueOnce([]); // Create default files
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Workspace',
          description: 'Test workspace'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('session');
    });
  });

  // ========================================
  // MCP Server Endpoints
  // ========================================
  describe('MCP Servers', () => {
    let authToken;

    beforeAll(async () => {
      const jwt = await import('jsonwebtoken');
      authToken = jwt.default.sign(
        { userId: 'test-user-id', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('GET /api/mcp/servers - should list MCP servers', async () => {
      mockSql.mockResolvedValueOnce([
        { id: 'server-1', name: 'GitHub MCP', type: 'github', enabled: true }
      ]);

      const response = await request(app)
        .get('/api/mcp/servers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('servers');
    });

    test('POST /api/mcp/servers - should create MCP server', async () => {
      mockSql.mockResolvedValueOnce([{
        id: 'new-server-id',
        name: 'New MCP Server',
        type: 'filesystem',
        config: {},
        enabled: true
      }]);

      const response = await request(app)
        .post('/api/mcp/servers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New MCP Server',
          type: 'filesystem',
          config: { path: '/workspace' }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('server');
    });
  });

  // ========================================
  // Script Generator Endpoints
  // ========================================
  describe('Script Generator', () => {
    let authToken;

    beforeAll(async () => {
      const jwt = await import('jsonwebtoken');
      authToken = jwt.default.sign(
        { userId: 'test-user-id', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('POST /api/scripts/generate - should generate shell script', async () => {
      const response = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agentConfig: {
            name: 'my-agent',
            tools: [{ name: 'github', description: 'GitHub integration' }]
          },
          outputFormat: 'shell'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('script');
      expect(response.body.data).toHaveProperty('filename', 'setup.sh');
      expect(response.body.data).toHaveProperty('language', 'bash');
      expect(response.body.data.script).toContain('#!/bin/bash');
      expect(response.body.data.script).toContain('my-agent');
    });

    test('POST /api/scripts/generate - should generate CLAUDE.md', async () => {
      const response = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agentConfig: {
            name: 'my-agent',
            identity: 'AI assistant for development',
            tools: []
          },
          outputFormat: 'claudemd'
        })
        .expect(200);

      expect(response.body.data.filename).toBe('CLAUDE.md');
      expect(response.body.data.language).toBe('markdown');
      expect(response.body.data.script).toContain('# my-agent');
    });
  });
});

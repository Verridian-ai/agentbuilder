// Integration Tests - Full workflow and end-to-end testing
import { jest } from '@jest/globals';

// Mock the postgres module
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
        download: jest.fn().mockResolvedValue([Buffer.from('test content')]),
        save: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined)
      })
    })
  }))
}));

const request = (await import('supertest')).default;
const jwt = (await import('jsonwebtoken')).default;
const app = (await import('../server.js')).default;

describe('Integration Tests', () => {
  let authToken;
  let testUserId;

  // ========================================
  // Complete User Registration Flow
  // ========================================
  describe('User Registration Flow', () => {
    test('should complete full registration -> login -> verify flow', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'securePassword123';
      const name = 'Test User';

      // Step 1: Register
      mockSql.mockResolvedValueOnce([]); // No existing user
      mockSql.mockResolvedValueOnce([{ id: 'new-user-id', email, name }]);
      mockSql.mockResolvedValueOnce([{ id: 'session-id' }]); // Default session

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ email, password, name })
        .expect(201);

      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.data.token).toBeTruthy();

      const token = registerRes.body.data.token;
      testUserId = registerRes.body.data.user.id;

      // Step 2: Verify token
      mockSql.mockResolvedValueOnce([{ id: testUserId, email, name }]);

      const verifyRes = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.valid).toBe(true);
    });
  });

  // ========================================
  // Complete IDE Session Flow
  // ========================================
  describe('IDE Session Flow', () => {
    beforeAll(() => {
      authToken = jwt.sign(
        { userId: 'test-user', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('should complete session creation -> file operations -> terminal flow', async () => {
      // Step 1: Create session
      mockSql.mockResolvedValueOnce([{
        id: 'session-123',
        name: 'Test Project',
        status: 'running',
        region: 'australia-southeast1'
      }]);
      mockSql.mockResolvedValueOnce([]); // Create files
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const sessionRes = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Project', description: 'Integration test' })
        .expect(201);

      expect(sessionRes.body.success).toBe(true);
      const sessionId = sessionRes.body.data.session.id;

      // Step 2: Write a file
      mockSql.mockResolvedValueOnce([{ id: sessionId }]); // Get session
      mockSql.mockResolvedValueOnce([]); // Upsert file

      const writeRes = await request(app)
        .post('/api/files/write')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/workspace/src/app.ts',
          content: 'console.log("Hello World");',
          sessionId
        })
        .expect(200);

      expect(writeRes.body.success).toBe(true);
      expect(writeRes.body.data.saved).toBe(true);

      // Step 3: Read the file
      mockSql.mockResolvedValueOnce([{
        path: '/workspace/src/app.ts',
        content: 'console.log("Hello World");',
        language: 'typescript'
      }]);

      const readRes = await request(app)
        .get('/api/files/read')
        .query({ path: '/workspace/src/app.ts', sessionId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(readRes.body.success).toBe(true);
      expect(readRes.body.data.content).toContain('Hello World');

      // Step 4: Execute terminal command
      const terminalRes = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          command: 'node --version',
          sessionId
        })
        .expect(200);

      expect(terminalRes.body.success).toBe(true);
      expect(terminalRes.body.data.output).toContain('v20');
    });
  });

  // ========================================
  // Complete MCP Configuration Flow
  // ========================================
  describe('MCP Configuration Flow', () => {
    beforeAll(() => {
      authToken = jwt.sign(
        { userId: 'test-user', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('should complete MCP server CRUD operations', async () => {
      // Step 1: Create MCP server
      mockSql.mockResolvedValueOnce([{
        id: 'mcp-server-1',
        name: 'GitHub MCP',
        type: 'github',
        config: { token: 'test-token' },
        enabled: true
      }]);

      const createRes = await request(app)
        .post('/api/mcp/servers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'GitHub MCP',
          type: 'github',
          config: { token: 'test-token' }
        })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      const serverId = createRes.body.data.server.id;

      // Step 2: List MCP servers
      mockSql.mockResolvedValueOnce([{
        id: serverId,
        name: 'GitHub MCP',
        type: 'github',
        enabled: true
      }]);

      const listRes = await request(app)
        .get('/api/mcp/servers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.servers.length).toBeGreaterThan(0);

      // Step 3: Update MCP server
      mockSql.mockResolvedValueOnce([{
        id: serverId,
        name: 'GitHub MCP Updated',
        type: 'github',
        enabled: false
      }]);

      const updateRes = await request(app)
        .put(`/api/mcp/servers/${serverId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'GitHub MCP Updated',
          enabled: false
        })
        .expect(200);

      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.server.name).toBe('GitHub MCP Updated');

      // Step 4: Delete MCP server
      mockSql.mockResolvedValueOnce([]);

      const deleteRes = await request(app)
        .delete(`/api/mcp/servers/${serverId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteRes.body.success).toBe(true);
    });
  });

  // ========================================
  // Complete Script Generation Flow
  // ========================================
  describe('Script Generation Flow', () => {
    beforeAll(() => {
      authToken = jwt.sign(
        { userId: 'test-user', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('should generate scripts in all formats', async () => {
      const agentConfig = {
        name: 'my-agent',
        identity: 'AI development assistant',
        instructions: 'Help with coding tasks',
        tools: [
          { name: 'github', description: 'GitHub integration', package: '@mcp/github' },
          { name: 'filesystem', description: 'File system access' }
        ]
      };

      // Generate shell script
      const shellRes = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ agentConfig, outputFormat: 'shell' })
        .expect(200);

      expect(shellRes.body.data.filename).toBe('setup.sh');
      expect(shellRes.body.data.script).toContain('#!/bin/bash');
      expect(shellRes.body.data.script).toContain('my-agent');

      // Generate PowerShell script
      const psRes = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ agentConfig, outputFormat: 'powershell' })
        .expect(200);

      expect(psRes.body.data.filename).toBe('setup.ps1');
      expect(psRes.body.data.script).toContain('Write-Host');

      // Generate CLAUDE.md
      const mdRes = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ agentConfig, outputFormat: 'claudemd' })
        .expect(200);

      expect(mdRes.body.data.filename).toBe('CLAUDE.md');
      expect(mdRes.body.data.script).toContain('## Identity');
      expect(mdRes.body.data.script).toContain('## Tools');
    });
  });

  // ========================================
  // AI Chat Flow
  // ========================================
  describe('AI Chat Flow', () => {
    beforeAll(() => {
      authToken = jwt.sign(
        { userId: 'test-user', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('should handle AI chat request (without API key)', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello!' }
          ]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('content');
      // Without API key, should return fallback message
      expect(response.body.data.content).toContain('OpenRouter API key');
    });

    test('should list available AI models', async () => {
      const response = await request(app)
        .get('/api/ai/models')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.models).toHaveLength(7);

      const modelIds = response.body.data.models.map(m => m.id);
      expect(modelIds).toContain('anthropic/claude-3.5-sonnet');
      expect(modelIds).toContain('openai/gpt-4-turbo');
    });
  });

  // ========================================
  // Database Initialization Flow
  // ========================================
  describe('Database Initialization', () => {
    test('should initialize all database tables', async () => {
      // Mock all CREATE TABLE and CREATE INDEX statements
      for (let i = 0; i < 13; i++) {
        mockSql.mockResolvedValueOnce([]);
      }

      const response = await request(app)
        .post('/api/db/init')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tables).toContain('users');
      expect(response.body.data.tables).toContain('cloud_ide_sessions');
      expect(response.body.data.tables).toContain('cloud_ide_files');
      expect(response.body.data.tables).toContain('terminal_history');
      expect(response.body.data.tables).toContain('projects');
      expect(response.body.data.tables).toContain('mcp_servers');
      expect(response.body.data.tables).toContain('ai_conversations');
      expect(response.body.data.indexes.length).toBeGreaterThanOrEqual(6);
    });
  });

  // ========================================
  // Error Handling Flow
  // ========================================
  describe('Error Handling', () => {
    test('should handle unauthorized access consistently', async () => {
      const protectedEndpoints = [
        { method: 'get', path: '/api/files' },
        { method: 'get', path: '/api/sessions' },
        { method: 'post', path: '/api/files/write' },
        { method: 'post', path: '/api/terminal/execute' },
        { method: 'get', path: '/api/mcp/servers' }
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app)[endpoint.method](endpoint.path).expect(401);
        expect(response.body.error).toBe('Access token required');
      }
    });

    test('should handle invalid token consistently', async () => {
      const invalidToken = 'invalid.token.here';

      const response = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(403);

      expect(response.body.error).toBe('Invalid or expired token');
    });

    test('should handle validation errors with proper format', async () => {
      authToken = jwt.sign(
        { userId: 'test-user', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Missing command
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('message');
    });
  });

  // ========================================
  // Concurrent Request Handling
  // ========================================
  describe('Concurrent Requests', () => {
    beforeAll(() => {
      authToken = jwt.sign(
        { userId: 'test-user', email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
        { expiresIn: '1h' }
      );
    });

    test('should handle multiple concurrent requests', async () => {
      // Setup mocks for concurrent requests
      for (let i = 0; i < 10; i++) {
        mockSql.mockResolvedValueOnce([{ id: 'session-1' }]);
        mockSql.mockResolvedValueOnce([]);
      }

      const requests = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/terminal/execute')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ command: 'pwd' })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});

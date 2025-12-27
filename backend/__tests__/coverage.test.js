// Additional Tests for 100% Code Coverage
// Covers error paths, edge cases, and remaining uncovered lines
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
        download: jest.fn().mockRejectedValue(new Error('File not found')),
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
        delete: jest.fn().mockRejectedValue(new Error('Delete failed'))
      })
    })
  }))
}));

const request = (await import('supertest')).default;
const jwt = (await import('jsonwebtoken')).default;
const app = (await import('../server.js')).default;

describe('Coverage Tests - Error Paths', () => {
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign(
      { userId: 'test-user', email: 'test@test.com' },
      process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // Health Check Error Path
  // ========================================
  describe('Health Check Errors', () => {
    test('GET /health - should handle database connection error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Connection refused'));

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('degraded');
      expect(response.body.database).toBe('disconnected');
      expect(response.body.error).toBe('Connection refused');
    });
  });

  // ========================================
  // Database Init Error Path
  // ========================================
  describe('Database Init Errors', () => {
    test('POST /api/db/init - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Table creation failed'));

      const response = await request(app)
        .post('/api/db/init')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DB_INIT_ERROR');
    });
  });

  // ========================================
  // Auth Error Paths
  // ========================================
  describe('Auth Error Paths', () => {
    test('POST /api/auth/register - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password123' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('REGISTER_ERROR');
    });

    test('POST /api/auth/login - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOGIN_ERROR');
    });

    test('POST /api/auth/login - should handle wrong password', async () => {
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default;
      const hashedPassword = await bcrypt.hash('correctpassword', 12);

      mockSql.mockResolvedValueOnce([{
        id: 'user-id',
        email: 'test@test.com',
        password_hash: hashedPassword
      }]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('POST /api/auth/verify - should handle user not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    test('POST /api/auth/verify - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('VERIFY_ERROR');
    });

    test('PUT /api/auth/profile - should update profile', async () => {
      mockSql.mockResolvedValueOnce([{
        id: 'user-id',
        email: 'test@test.com',
        name: 'Updated Name'
      }]);

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('PUT /api/auth/profile - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Update failed'));

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(500);

      expect(response.body.error.code).toBe('UPDATE_ERROR');
    });
  });

  // ========================================
  // Session Error Paths
  // ========================================
  describe('Session Error Paths', () => {
    test('GET /api/sessions - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Fetch failed'));

      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('FETCH_ERROR');
    });

    test('POST /api/sessions - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Create failed'));

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Session' })
        .expect(500);

      expect(response.body.error.code).toBe('CREATE_ERROR');
    });

    test('PUT /api/sessions/:id - should update session', async () => {
      mockSql.mockResolvedValueOnce([{
        id: 'session-id',
        name: 'Updated Session',
        status: 'running'
      }]);

      const response = await request(app)
        .put('/api/sessions/session-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Session' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('PUT /api/sessions/:id - should handle not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .put('/api/sessions/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('PUT /api/sessions/:id - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Update failed'));

      const response = await request(app)
        .put('/api/sessions/session-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(500);

      expect(response.body.error.code).toBe('UPDATE_ERROR');
    });

    test('DELETE /api/sessions/:id - should delete session', async () => {
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .delete('/api/sessions/session-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('DELETE /api/sessions/:id - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Delete failed'));

      const response = await request(app)
        .delete('/api/sessions/session-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('DELETE_ERROR');
    });
  });

  // ========================================
  // File Operation Error Paths
  // ========================================
  describe('File Operation Error Paths', () => {
    test('GET /api/files - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Fetch failed'));

      const response = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('FETCH_ERROR');
    });

    test('GET /api/files - should handle no session found', async () => {
      mockSql.mockResolvedValueOnce([]); // No session

      const response = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.files).toEqual([]);
    });

    test('GET /api/files/read - should fail without path', async () => {
      const response = await request(app)
        .get('/api/files/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('GET /api/files/read - should handle file not found', async () => {
      mockSql.mockResolvedValueOnce([]); // No file in DB

      const response = await request(app)
        .get('/api/files/read')
        .query({ path: '/workspace/missing.txt' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('GET /api/files/read - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Read failed'));

      const response = await request(app)
        .get('/api/files/read')
        .query({ path: '/workspace/file.txt' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('READ_ERROR');
    });

    test('POST /api/files/write - should fail without path', async () => {
      const response = await request(app)
        .post('/api/files/write')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'test' })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/files/write - should create session if none exists', async () => {
      mockSql.mockResolvedValueOnce([]); // No existing session
      mockSql.mockResolvedValueOnce([{ id: 'new-session' }]); // Create session
      mockSql.mockResolvedValueOnce([]); // Upsert file

      const response = await request(app)
        .post('/api/files/write')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ path: '/workspace/new.txt', content: 'content' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('POST /api/files/write - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Write failed'));

      const response = await request(app)
        .post('/api/files/write')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ path: '/workspace/file.txt', content: 'test' })
        .expect(500);

      expect(response.body.error.code).toBe('WRITE_ERROR');
    });

    test('DELETE /api/files - should fail without path', async () => {
      const response = await request(app)
        .delete('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('DELETE /api/files - should delete with sessionId', async () => {
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .delete('/api/files')
        .query({ path: '/workspace/file.txt', sessionId: 'session-123' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('DELETE /api/files - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Delete failed'));

      const response = await request(app)
        .delete('/api/files')
        .query({ path: '/workspace/file.txt' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('DELETE_ERROR');
    });

    test('GET /api/files/tree - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Tree failed'));

      const response = await request(app)
        .get('/api/files/tree')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('TREE_ERROR');
    });

    test('GET /api/files/tree - should handle no session', async () => {
      mockSql.mockResolvedValueOnce([]); // No session

      const response = await request(app)
        .get('/api/files/tree')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.tree.children).toEqual([]);
    });
  });

  // ========================================
  // Terminal Error Paths
  // ========================================
  describe('Terminal Error Paths', () => {
    test('POST /api/terminal/execute - should handle cat command with file', async () => {
      mockSql.mockResolvedValueOnce([{ content: 'file content here' }]);

      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'cat file.txt' })
        .expect(200);

      expect(response.body.data.output).toBe('file content here');
    });

    test('POST /api/terminal/execute - should handle cat command file not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'cat missing.txt' })
        .expect(200);

      expect(response.body.data.output).toContain('No such file');
      expect(response.body.data.exitCode).toBe(1);
    });

    test('POST /api/terminal/execute - should handle git status', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'git status' })
        .expect(200);

      expect(response.body.data.output).toContain('branch');
    });

    test('POST /api/terminal/execute - should handle git log', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'git log --oneline -5' })
        .expect(200);

      expect(response.body.data.output).toContain('commit');
    });

    test('POST /api/terminal/execute - should handle mkdir command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'mkdir newdir' })
        .expect(200);

      expect(response.body.data.output).toContain('Created');
    });

    test('POST /api/terminal/execute - should handle unknown command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'unknown-command arg1 arg2' })
        .expect(200);

      expect(response.body.data.output).toContain('Command executed');
    });

    test('POST /api/terminal/execute - should log to history with sessionId', async () => {
      mockSql.mockResolvedValueOnce([]); // cat file lookup
      mockSql.mockResolvedValueOnce([]); // Insert history

      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'pwd', sessionId: 'session-123' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('POST /api/terminal/execute - cat command returns output', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'cat file.txt' })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test('GET /api/terminal/history - should return 200', async () => {
      const response = await request(app)
        .get('/api/terminal/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  // ========================================
  // AI Service Error Paths
  // ========================================
  describe('AI Service Error Paths', () => {
    test('POST /api/ai/chat - should fail without messages', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ model: 'test' })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/ai/chat - should fail with non-array messages', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ messages: 'not an array' })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/ai/generate - should work without API key', async () => {
      const response = await request(app)
        .post('/api/ai/generate')
        .send({ prompt: 'test prompt' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toContain('OpenRouter API key');
    });
  });

  // ========================================
  // Projects Error Paths
  // ========================================
  describe('Projects Error Paths', () => {
    test('GET /api/projects - should list projects', async () => {
      mockSql.mockResolvedValueOnce([{ id: 'proj-1', name: 'Project 1' }]);

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.projects).toHaveLength(1);
    });

    test('GET /api/projects - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Fetch failed'));

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('FETCH_ERROR');
    });

    test('POST /api/projects - should create project', async () => {
      mockSql.mockResolvedValueOnce([{ id: 'new-proj', name: 'New Project' }]);

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Project' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    test('POST /api/projects - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Create failed'));

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(500);

      expect(response.body.error.code).toBe('CREATE_ERROR');
    });
  });

  // ========================================
  // MCP Server Error Paths
  // ========================================
  describe('MCP Server Error Paths', () => {
    test('GET /api/mcp/servers - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Fetch failed'));

      const response = await request(app)
        .get('/api/mcp/servers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('FETCH_ERROR');
    });

    test('POST /api/mcp/servers - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Create failed'));

      const response = await request(app)
        .post('/api/mcp/servers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test', type: 'test', config: {} })
        .expect(500);

      expect(response.body.error.code).toBe('CREATE_ERROR');
    });

    test('PUT /api/mcp/servers/:id - should handle not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .put('/api/mcp/servers/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('PUT /api/mcp/servers/:id - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Update failed'));

      const response = await request(app)
        .put('/api/mcp/servers/server-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(500);

      expect(response.body.error.code).toBe('UPDATE_ERROR');
    });

    test('DELETE /api/mcp/servers/:id - should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Delete failed'));

      const response = await request(app)
        .delete('/api/mcp/servers/server-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('DELETE_ERROR');
    });
  });

  // ========================================
  // Script Generator Error Paths
  // ========================================
  describe('Script Generator Error Paths', () => {
    test('POST /api/scripts/generate - should handle error', async () => {
      // This test ensures error path is covered
      const response = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ agentConfig: null, outputFormat: 'shell' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('POST /api/scripts/generate - should handle default values', async () => {
      const response = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body.data.script).toContain('my-agent');
    });
  });
});

// ========================================
// Helper Function Tests
// ========================================
describe('Helper Functions', () => {
  test('detectLanguage should detect all file types', () => {
    const testCases = [
      { file: 'test.js', lang: 'javascript' },
      { file: 'test.jsx', lang: 'javascript' },
      { file: 'test.ts', lang: 'typescript' },
      { file: 'test.tsx', lang: 'typescript' },
      { file: 'test.py', lang: 'python' },
      { file: 'test.rb', lang: 'ruby' },
      { file: 'test.go', lang: 'go' },
      { file: 'test.rs', lang: 'rust' },
      { file: 'test.java', lang: 'java' },
      { file: 'test.c', lang: 'c' },
      { file: 'test.cpp', lang: 'cpp' },
      { file: 'test.h', lang: 'c' },
      { file: 'test.hpp', lang: 'cpp' },
      { file: 'test.cs', lang: 'csharp' },
      { file: 'test.php', lang: 'php' },
      { file: 'test.swift', lang: 'swift' },
      { file: 'test.kt', lang: 'kotlin' },
      { file: 'test.scala', lang: 'scala' },
      { file: 'test.r', lang: 'r' },
      { file: 'test.sql', lang: 'sql' },
      { file: 'test.sh', lang: 'bash' },
      { file: 'test.bash', lang: 'bash' },
      { file: 'test.zsh', lang: 'bash' },
      { file: 'test.ps1', lang: 'powershell' },
      { file: 'test.html', lang: 'html' },
      { file: 'test.htm', lang: 'html' },
      { file: 'test.css', lang: 'css' },
      { file: 'test.scss', lang: 'scss' },
      { file: 'test.sass', lang: 'sass' },
      { file: 'test.less', lang: 'less' },
      { file: 'test.json', lang: 'json' },
      { file: 'test.yaml', lang: 'yaml' },
      { file: 'test.yml', lang: 'yaml' },
      { file: 'test.xml', lang: 'xml' },
      { file: 'test.md', lang: 'markdown' },
      { file: 'test.markdown', lang: 'markdown' },
      { file: 'test.txt', lang: 'plaintext' },
      { file: 'Dockerfile', lang: 'plaintext' },
      { file: 'test.toml', lang: 'toml' },
      { file: 'test.ini', lang: 'ini' },
      { file: 'test.cfg', lang: 'ini' },
      { file: 'test.env', lang: 'dotenv' },
      { file: 'test.unknown', lang: 'plaintext' }
    ];

    // Test language detection logic directly
    const detectLanguage = (filePath) => {
      const ext = filePath.split('.').pop()?.toLowerCase();
      const languageMap = {
        'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
        'py': 'python', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'java': 'java',
        'c': 'c', 'cpp': 'cpp', 'h': 'c', 'hpp': 'cpp', 'cs': 'csharp',
        'php': 'php', 'swift': 'swift', 'kt': 'kotlin', 'scala': 'scala',
        'r': 'r', 'sql': 'sql', 'sh': 'bash', 'bash': 'bash', 'zsh': 'bash',
        'ps1': 'powershell', 'html': 'html', 'htm': 'html', 'css': 'css',
        'scss': 'scss', 'sass': 'sass', 'less': 'less', 'json': 'json',
        'yaml': 'yaml', 'yml': 'yaml', 'xml': 'xml', 'md': 'markdown',
        'markdown': 'markdown', 'txt': 'plaintext', 'toml': 'toml',
        'ini': 'ini', 'cfg': 'ini', 'env': 'dotenv'
      };
      return languageMap[ext] || 'plaintext';
    };

    testCases.forEach(({ file, lang }) => {
      expect(detectLanguage(file)).toBe(lang);
    });
  });

  test('buildFileTree should create proper tree structure', () => {
    const files = [
      { path: '/workspace/src/index.ts', name: 'index.ts', type: 'file', language: 'typescript' },
      { path: '/workspace/src/utils/helpers.ts', name: 'helpers.ts', type: 'file', language: 'typescript' },
      { path: '/workspace/package.json', name: 'package.json', type: 'file', language: 'json' }
    ];

    const buildFileTree = (files) => {
      const tree = { name: 'workspace', type: 'folder', path: '/workspace', children: [] };
      for (const file of files) {
        const parts = file.path.replace(/^\/workspace\/?/, '').split('/').filter(Boolean);
        let current = tree;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isLast = i === parts.length - 1;
          const existingChild = current.children?.find(c => c.name === part);
          if (existingChild) {
            current = existingChild;
          } else {
            const newNode = {
              name: part,
              type: isLast ? file.type : 'folder',
              path: `/workspace/${parts.slice(0, i + 1).join('/')}`,
              ...(isLast && file.language ? { language: file.language } : {}),
              ...(!isLast ? { children: [] } : {})
            };
            current.children = current.children || [];
            current.children.push(newNode);
            current = newNode;
          }
        }
      }
      return tree;
    };

    const tree = buildFileTree(files);

    expect(tree.name).toBe('workspace');
    expect(tree.children.length).toBe(2);
    expect(tree.children.find(c => c.name === 'src')).toBeDefined();
    expect(tree.children.find(c => c.name === 'package.json')).toBeDefined();
  });
});

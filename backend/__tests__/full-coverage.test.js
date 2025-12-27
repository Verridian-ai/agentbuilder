// Full Coverage Tests - Targeting remaining uncovered lines
// This file tests: GCS operations, AI with API key, SIGTERM, edge cases
import { jest } from '@jest/globals';

// Mock fetch for OpenRouter API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock postgres
const mockSql = jest.fn();
mockSql.end = jest.fn().mockResolvedValue();

jest.unstable_mockModule('postgres', () => ({
  default: () => mockSql
}));

// Mock GCS with successful operations
const mockDownload = jest.fn();
const mockSave = jest.fn();
const mockDelete = jest.fn();

jest.unstable_mockModule('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({
    bucket: jest.fn().mockReturnValue({
      file: jest.fn().mockReturnValue({
        download: mockDownload,
        save: mockSave,
        delete: mockDelete
      })
    })
  }))
}));

// Set environment to have GOOGLE_CLOUD_PROJECT_ID for GCS code paths
process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project';
process.env.OPENROUTER_API_KEY = 'test-api-key';
process.env.PORT = '8082';

const request = (await import('supertest')).default;
const jwt = (await import('jsonwebtoken')).default;
const app = (await import('../server.js')).default;

describe('Full Coverage Tests', () => {
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign(
      { userId: 'test-user-fc', email: 'fullcoverage@test.com' },
      process.env.JWT_SECRET || 'test-jwt-secret-for-testing',
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  // ========================================
  // Line 321: Login validation - missing password
  // ========================================
  describe('Login Validation Paths', () => {
    test('should fail login with missing password only', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should fail login with missing email only', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should successfully login and update last_login', async () => {
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default;
      const hashedPassword = await bcrypt.hash('correctpassword', 12);

      // First call: SELECT user
      mockSql.mockResolvedValueOnce([{
        id: 'user-123',
        email: 'test@example.com',
        password_hash: hashedPassword,
        name: 'Test User',
        avatar_url: null,
        settings: {}
      }]);
      // Second call: UPDATE last_login
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'correctpassword' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });

  // ========================================
  // Lines 569, 584-591: Files with sessionId and no session
  // ========================================
  describe('File Operations Edge Cases', () => {
    test('GET /api/files with sessionId should filter by session', async () => {
      mockSql.mockResolvedValueOnce([
        { id: 'file-1', path: '/workspace/test.js', name: 'test.js' }
      ]);

      const response = await request(app)
        .get('/api/files')
        .query({ sessionId: 'session-123' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.files).toHaveLength(1);
    });

    test('GET /api/files with path filter should work', async () => {
      mockSql.mockResolvedValueOnce([
        { id: 'file-1', path: '/workspace/src/index.js', name: 'index.js' }
      ]);

      const response = await request(app)
        .get('/api/files')
        .query({ sessionId: 'session-123', path: '/workspace/src' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('GET /api/files without sessionId gets from first session with files', async () => {
      // First query: get session
      mockSql.mockResolvedValueOnce([{ id: 'session-1' }]);
      // Second query: get files
      mockSql.mockResolvedValueOnce([
        { id: 'file-1', path: '/workspace/README.md', name: 'README.md' }
      ]);

      const response = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ========================================
  // Line 651: GCS download success path
  // ========================================
  describe('GCS Download Path', () => {
    test('GET /api/files/read should fallback to GCS when DB file not found', async () => {
      // DB returns no file
      mockSql.mockResolvedValueOnce([]);
      // GCS download succeeds
      mockDownload.mockResolvedValueOnce([Buffer.from('file content from GCS')]);

      const response = await request(app)
        .get('/api/files/read')
        .query({ path: '/workspace/gcs-file.txt' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('file content from GCS');
    });
  });

  // ========================================
  // Lines 723-726: GCS save in files/write
  // ========================================
  describe('GCS Save Path', () => {
    test('POST /api/files/write should save to GCS when configured', async () => {
      // Get session
      mockSql.mockResolvedValueOnce([{ id: 'session-123' }]);
      // Upsert file
      mockSql.mockResolvedValueOnce([]);
      // GCS save succeeds
      mockSave.mockResolvedValueOnce();

      const response = await request(app)
        .post('/api/files/write')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/workspace/gcs-file.txt',
          content: 'content to save',
          sessionId: 'session-123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockSave).toHaveBeenCalled();
    });

    test('POST /api/files/write should continue if GCS save fails', async () => {
      // Get session
      mockSql.mockResolvedValueOnce([{ id: 'session-123' }]);
      // Upsert file
      mockSql.mockResolvedValueOnce([]);
      // GCS save fails
      mockSave.mockRejectedValueOnce(new Error('GCS save failed'));

      const response = await request(app)
        .post('/api/files/write')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          path: '/workspace/test.txt',
          content: 'test',
          sessionId: 'session-123'
        })
        .expect(200);

      // Should still succeed even if GCS fails
      expect(response.body.success).toBe(true);
    });
  });

  // ========================================
  // Lines 776-779: GCS delete in files/delete
  // ========================================
  describe('GCS Delete Path', () => {
    test('DELETE /api/files should delete from GCS when configured', async () => {
      // DB delete
      mockSql.mockResolvedValueOnce([]);
      // GCS delete succeeds
      mockDelete.mockResolvedValueOnce();

      const response = await request(app)
        .delete('/api/files')
        .query({ path: '/workspace/file-to-delete.txt' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });

    test('DELETE /api/files should continue if GCS delete fails', async () => {
      // DB delete
      mockSql.mockResolvedValueOnce([]);
      // GCS delete fails
      mockDelete.mockRejectedValueOnce(new Error('GCS delete failed'));

      const response = await request(app)
        .delete('/api/files')
        .query({ path: '/workspace/file.txt' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should still succeed
      expect(response.body.success).toBe(true);
    });
  });

  // ========================================
  // Lines 801, 815-824: File tree edge cases
  // ========================================
  describe('File Tree Edge Cases', () => {
    test('GET /api/files/tree with sessionId should return tree', async () => {
      mockSql.mockResolvedValueOnce([
        { path: '/workspace/src/index.ts', name: 'index.ts', type: 'file', language: 'typescript' },
        { path: '/workspace/package.json', name: 'package.json', type: 'file', language: 'json' }
      ]);

      const response = await request(app)
        .get('/api/files/tree')
        .query({ sessionId: 'session-123' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tree.name).toBe('workspace');
    });

    test('GET /api/files/tree without sessionId gets first session', async () => {
      // Get first session
      mockSql.mockResolvedValueOnce([{ id: 'session-1' }]);
      // Get files for tree
      mockSql.mockResolvedValueOnce([
        { path: '/workspace/README.md', name: 'README.md', type: 'file', language: 'markdown' }
      ]);

      const response = await request(app)
        .get('/api/files/tree')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ========================================
  // Lines 893, 901: Terminal commands - npm and git
  // ========================================
  describe('Terminal NPM and Git Commands', () => {
    test('POST /api/terminal/execute should handle npm command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'npm install express' })
        .expect(200);

      expect(response.body.data.output).toContain('npm');
      expect(response.body.data.output).toContain('Running');
    });

    test('POST /api/terminal/execute should handle other git commands', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'git branch' })
        .expect(200);

      expect(response.body.data.output).toContain('git');
    });

    test('POST /api/terminal/execute should handle touch command', async () => {
      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'touch newfile.txt' })
        .expect(200);

      expect(response.body.data.output).toContain('Created');
    });
  });

  // ========================================
  // Line 922: Terminal execute error path
  // ========================================
  describe('Terminal Execute Error', () => {
    test('POST /api/terminal/execute should handle internal error', async () => {
      // Force error by making the SQL call fail during cat command
      mockSql.mockRejectedValueOnce(new Error('Database connection lost'));

      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ command: 'cat somefile.txt' })
        .expect(500);

      expect(response.body.error.code).toBe('EXEC_ERROR');
    });
  });

  // ========================================
  // Lines 922, 947: Terminal with sessionId
  // ========================================
  describe('Terminal History Logging', () => {
    test('POST /api/terminal/execute should log history with sessionId', async () => {
      // Insert history
      mockSql.mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/terminal/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          command: 'ls',
          sessionId: 'session-123',
          workingDir: '/workspace/src'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('GET /api/terminal/history with sessionId should filter', async () => {
      mockSql.mockResolvedValueOnce([
        { command: 'ls', output: 'files', exit_code: 0, created_at: new Date() }
      ]);

      const response = await request(app)
        .get('/api/terminal/history')
        .query({ sessionId: 'session-123', limit: '10' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.history).toHaveLength(1);
    });

    test('GET /api/terminal/history should handle database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('History fetch failed'));

      const response = await request(app)
        .get('/api/terminal/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error.code).toBe('HISTORY_ERROR');
    });
  });

  // ========================================
  // Lines 981-1014: AI Chat with API Key
  // ========================================
  describe('AI Chat with API Key', () => {
    test('POST /api/ai/chat should call OpenRouter API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'AI response' } }],
          model: 'anthropic/claude-3.5-sonnet',
          usage: { prompt_tokens: 10, completion_tokens: 20 }
        })
      });

      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'anthropic/claude-3.5-sonnet'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('AI response');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.any(Object)
      );
    });

    test('POST /api/ai/chat should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: 'Invalid request' }
        })
      });

      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          messages: [{ role: 'user', content: 'Hello' }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AI_ERROR');
    });

    test('POST /api/ai/chat should handle fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          messages: [{ role: 'user', content: 'Hello' }]
        })
        .expect(500);

      expect(response.body.error.code).toBe('AI_ERROR');
    });
  });

  // ========================================
  // Lines 1035-1057: AI Generate with API Key
  // ========================================
  describe('AI Generate with API Key', () => {
    test('POST /api/ai/generate should call OpenRouter API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Generated content' } }],
          model: 'anthropic/claude-3-haiku'
        })
      });

      const response = await request(app)
        .post('/api/ai/generate')
        .send({ prompt: 'Generate something' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Generated content');
    });

    test('POST /api/ai/generate should handle error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API error'));

      const response = await request(app)
        .post('/api/ai/generate')
        .send({ prompt: 'Generate something' })
        .expect(500);

      expect(response.body.error.code).toBe('GENERATE_ERROR');
    });
  });

  // ========================================
  // Line 1345: Script generate error path
  // ========================================
  describe('Script Generator', () => {
    test('POST /api/scripts/generate powershell format', async () => {
      const response = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agentConfig: {
            name: 'test-agent',
            tools: [{ name: 'tool1', description: 'desc' }]
          },
          outputFormat: 'powershell'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.language).toBe('powershell');
    });

    test('POST /api/scripts/generate claudemd format', async () => {
      const response = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agentConfig: {
            name: 'my-agent',
            identity: 'Test identity',
            instructions: 'Test instructions',
            tools: [{ name: 'tool1', config: { key: 'value' } }]
          },
          outputFormat: 'claudemd'
        })
        .expect(200);

      expect(response.body.data.language).toBe('markdown');
      expect(response.body.data.script).toContain('Test identity');
    });

    test('POST /api/scripts/generate with tools having package field', async () => {
      const response = await request(app)
        .post('/api/scripts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agentConfig: {
            name: 'pkg-agent',
            tools: [
              { name: 'custom-tool', package: '@custom/tool-pkg', description: 'Custom tool' }
            ]
          },
          outputFormat: 'shell'
        })
        .expect(200);

      expect(response.body.data.script).toContain('@custom/tool-pkg');
    });
  });

  // ========================================
  // Line 1424: buildFileTree with existing children
  // ========================================
  describe('File Tree Building Edge Cases', () => {
    test('Should handle files in nested directories with existing paths', async () => {
      mockSql.mockResolvedValueOnce([
        { path: '/workspace/src/components/Button.tsx', name: 'Button.tsx', type: 'file', language: 'typescript' },
        { path: '/workspace/src/components/Input.tsx', name: 'Input.tsx', type: 'file', language: 'typescript' },
        { path: '/workspace/src/utils/helpers.ts', name: 'helpers.ts', type: 'file', language: 'typescript' }
      ]);

      const response = await request(app)
        .get('/api/files/tree')
        .query({ sessionId: 'session-123' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const tree = response.body.data.tree;
      expect(tree.name).toBe('workspace');

      // Find src folder
      const srcFolder = tree.children.find(c => c.name === 'src');
      expect(srcFolder).toBeDefined();
      expect(srcFolder.type).toBe('folder');

      // Check components folder exists
      const componentsFolder = srcFolder.children.find(c => c.name === 'components');
      expect(componentsFolder).toBeDefined();
      expect(componentsFolder.children.length).toBe(2);
    });
  });
});

// ========================================
// SIGTERM Handler Test
// ========================================
describe('Graceful Shutdown', () => {
  test('should handle SIGTERM signal', async () => {
    // Create a mock for the sql.end function
    const mockEnd = jest.fn().mockResolvedValue();

    // We can't easily test SIGTERM without killing the process
    // But we can verify the handler is registered
    const listeners = process.listeners('SIGTERM');
    expect(listeners.length).toBeGreaterThan(0);
  });
});

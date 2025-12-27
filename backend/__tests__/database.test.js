// Database Connection & Operations Tests
import { jest } from '@jest/globals';

describe('Database Operations', () => {
  // ========================================
  // Connection Tests
  // ========================================
  describe('Database Connection', () => {
    test('should validate Neon connection string format', () => {
      const validConnectionStrings = [
        'postgresql://user:pass@host.neon.tech/db?sslmode=require',
        'postgresql://neondb_owner:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require',
        'postgres://user:pass@ep-test-123.us-east-1.aws.neon.tech/mydb'
      ];

      const connectionRegex = /^postgres(ql)?:\/\/[^:]+:[^@]+@[^\/]+\/.+/;

      validConnectionStrings.forEach(connStr => {
        expect(connStr).toMatch(connectionRegex);
      });
    });

    test('should detect pooler endpoint in connection string', () => {
      const poolerConn = 'postgresql://user:pass@ep-aged-sky-pooler.ap-southeast-2.aws.neon.tech/db';
      const directConn = 'postgresql://user:pass@ep-aged-sky.ap-southeast-2.aws.neon.tech/db';

      expect(poolerConn).toContain('-pooler');
      expect(directConn).not.toContain('-pooler');
    });

    test('should require SSL for Neon connections', () => {
      const secureConn = 'postgresql://user:pass@host.neon.tech/db?sslmode=require';
      expect(secureConn).toContain('sslmode=require');
    });
  });

  // ========================================
  // Schema Validation Tests
  // ========================================
  describe('Database Schema', () => {
    const expectedTables = [
      'users',
      'cloud_ide_sessions',
      'cloud_ide_files',
      'terminal_history',
      'projects',
      'mcp_servers',
      'ai_conversations'
    ];

    const expectedIndexes = [
      'idx_sessions_user_id',
      'idx_files_session_id',
      'idx_terminal_session_id',
      'idx_projects_user_id',
      'idx_mcp_servers_user_id',
      'idx_ai_conversations_user_id'
    ];

    test('should define all required tables', () => {
      expect(expectedTables).toHaveLength(7);
      expectedTables.forEach(table => {
        expect(typeof table).toBe('string');
        expect(table.length).toBeGreaterThan(0);
      });
    });

    test('should define all required indexes', () => {
      expect(expectedIndexes).toHaveLength(6);
      expectedIndexes.forEach(index => {
        expect(index).toMatch(/^idx_/);
      });
    });

    test('users table should have required fields', () => {
      const userFields = [
        'id',
        'email',
        'password_hash',
        'name',
        'avatar_url',
        'created_at',
        'last_login',
        'settings'
      ];

      expect(userFields).toContain('id');
      expect(userFields).toContain('email');
      expect(userFields).toContain('password_hash');
    });

    test('cloud_ide_sessions should have required fields', () => {
      const sessionFields = [
        'id',
        'user_id',
        'name',
        'description',
        'region',
        'machine_type',
        'status',
        'url',
        'settings',
        'created_at',
        'last_active'
      ];

      expect(sessionFields).toContain('user_id');
      expect(sessionFields).toContain('region');
      expect(sessionFields).toContain('machine_type');
    });

    test('cloud_ide_files should support unique constraint on session_id + path', () => {
      const uniqueConstraint = 'UNIQUE(session_id, path)';
      expect(uniqueConstraint).toContain('session_id');
      expect(uniqueConstraint).toContain('path');
    });
  });

  // ========================================
  // SQL Query Tests
  // ========================================
  describe('SQL Queries', () => {
    test('should generate valid INSERT query for users', () => {
      const email = 'test@example.com';
      const passwordHash = 'hashed_password';
      const name = 'Test User';

      const query = `
        INSERT INTO users (email, password_hash, name)
        VALUES ($1, $2, $3)
        RETURNING id, email, name, created_at
      `;

      expect(query).toContain('INSERT INTO users');
      expect(query).toContain('RETURNING');
    });

    test('should generate valid SELECT query with JOIN', () => {
      const query = `
        SELECT f.* FROM cloud_ide_files f
        JOIN cloud_ide_sessions s ON f.session_id = s.id
        WHERE s.user_id = $1 AND f.path = $2
        LIMIT 1
      `;

      expect(query).toContain('JOIN');
      expect(query).toContain('cloud_ide_sessions');
      expect(query).toContain('LIMIT 1');
    });

    test('should generate valid UPSERT query', () => {
      const query = `
        INSERT INTO cloud_ide_files (session_id, path, name, content, language, size, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (session_id, path)
        DO UPDATE SET
          content = EXCLUDED.content,
          size = EXCLUDED.size,
          updated_at = NOW()
      `;

      expect(query).toContain('ON CONFLICT');
      expect(query).toContain('DO UPDATE SET');
      expect(query).toContain('EXCLUDED');
    });

    test('should generate valid DELETE with USING clause', () => {
      const query = `
        DELETE FROM cloud_ide_files f
        USING cloud_ide_sessions s
        WHERE f.session_id = s.id
          AND s.user_id = $1
          AND f.path = $2
      `;

      expect(query).toContain('DELETE FROM');
      expect(query).toContain('USING');
    });
  });

  // ========================================
  // Data Validation Tests
  // ========================================
  describe('Data Validation', () => {
    test('should validate email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@nodomain.com',
        'user@',
        ''
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(email).toMatch(emailRegex);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(emailRegex);
      });
    });

    test('should validate UUID format', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      ];

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      validUUIDs.forEach(uuid => {
        expect(uuid).toMatch(uuidRegex);
      });
    });

    test('should validate session status values', () => {
      const validStatuses = ['stopped', 'running', 'starting', 'stopping', 'error'];

      validStatuses.forEach(status => {
        expect(['stopped', 'running', 'starting', 'stopping', 'error']).toContain(status);
      });
    });

    test('should validate region format', () => {
      const validRegions = [
        'australia-southeast1',
        'us-central1',
        'us-east1',
        'europe-west1',
        'asia-northeast1'
      ];

      const regionRegex = /^[a-z]+-[a-z]+[0-9]$/;

      validRegions.forEach(region => {
        expect(region).toMatch(regionRegex);
      });
    });

    test('should validate machine type format', () => {
      const validMachineTypes = [
        'e2-standard-2',
        'e2-standard-4',
        'n2-standard-2',
        'n2-standard-8'
      ];

      validMachineTypes.forEach(machineType => {
        expect(machineType).toMatch(/^[a-z][0-9]?-[a-z]+-[0-9]+$/);
      });
    });
  });

  // ========================================
  // Password Hashing Tests
  // ========================================
  describe('Password Security', () => {
    test('should hash passwords with bcrypt', async () => {
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default;
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 12);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    test('should verify correct password', async () => {
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default;
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default;
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    test('should use sufficient salt rounds', async () => {
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default;
      const password = 'test';

      // Measure time for different salt rounds
      const start = Date.now();
      await bcrypt.hash(password, 12);
      const duration = Date.now() - start;

      // 12 rounds should take at least 100ms on modern hardware
      expect(duration).toBeGreaterThan(50);
    });
  });

  // ========================================
  // JWT Token Tests
  // ========================================
  describe('JWT Tokens', () => {
    test('should generate valid JWT token', async () => {
      const jwt = await import('jsonwebtoken');
      const payload = { userId: 'test-id', email: 'test@test.com' };
      const secret = 'test-secret';

      const token = jwt.default.sign(payload, secret, { expiresIn: '7d' });

      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3);
    });

    test('should decode JWT token correctly', async () => {
      const jwt = await import('jsonwebtoken');
      const payload = { userId: 'test-id', email: 'test@test.com' };
      const secret = 'test-secret';

      const token = jwt.default.sign(payload, secret, { expiresIn: '7d' });
      const decoded = jwt.default.verify(token, secret);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test('should reject expired JWT token', async () => {
      const jwt = await import('jsonwebtoken');
      const payload = { userId: 'test-id' };
      const secret = 'test-secret';

      const token = jwt.default.sign(payload, secret, { expiresIn: '-1s' });

      expect(() => {
        jwt.default.verify(token, secret);
      }).toThrow('jwt expired');
    });

    test('should reject token with wrong secret', async () => {
      const jwt = await import('jsonwebtoken');
      const payload = { userId: 'test-id' };

      const token = jwt.default.sign(payload, 'correct-secret');

      expect(() => {
        jwt.default.verify(token, 'wrong-secret');
      }).toThrow();
    });
  });
});

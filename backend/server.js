import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Storage } from '@google-cloud/storage';
import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Info']
}));
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'agent-builder-secret-key-2024';

// Neon DB connection with connection pooling
const NEON_CONNECTION_STRING = process.env.NEON_DB_CONNECTION_STRING ||
  'postgresql://neondb_owner:npg_rQvf5D0HGxBw@ep-aged-sky-a7p3va5h-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require';

const sql = postgres(NEON_CONNECTION_STRING, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require'
});

// Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'agent-builder-platform'
});
const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET || 'agent-builder-ide-files');

// OpenRouter API Key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// ============================================================================
// MIDDLEWARE
// ============================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============================================================================
// HEALTH & STATUS
// ============================================================================

app.get('/health', async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        neon: 'connected',
        storage: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'configured' : 'simulated'
      }
    });
  } catch (error) {
    res.json({
      status: 'degraded',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/status', async (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'running',
      database: 'neon-postgresql',
      storage: 'google-cloud-storage',
      region: process.env.REGION || 'australia-southeast1',
      uptime: process.uptime()
    }
  });
});

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

app.post('/api/db/init', async (req, res) => {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ,
        settings JSONB DEFAULT '{}'::jsonb
      )
    `;

    // Create cloud_ide_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS cloud_ide_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        region VARCHAR(100) DEFAULT 'australia-southeast1',
        machine_type VARCHAR(100) DEFAULT 'e2-standard-2',
        status VARCHAR(50) DEFAULT 'stopped',
        url TEXT,
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_active TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create cloud_ide_files table
    await sql`
      CREATE TABLE IF NOT EXISTS cloud_ide_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES cloud_ide_sessions(id) ON DELETE CASCADE,
        path TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        content TEXT,
        type VARCHAR(50) DEFAULT 'file',
        language VARCHAR(50),
        size INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(session_id, path)
      )
    `;

    // Create terminal_history table
    await sql`
      CREATE TABLE IF NOT EXISTS terminal_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES cloud_ide_sessions(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        command TEXT NOT NULL,
        output TEXT,
        exit_code INTEGER DEFAULT 0,
        working_dir TEXT DEFAULT '/workspace',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        template VARCHAR(100),
        github_url TEXT,
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create mcp_servers table for MCP configurations
    await sql`
      CREATE TABLE IF NOT EXISTS mcp_servers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        config JSONB NOT NULL,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create ai_conversations table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id UUID REFERENCES cloud_ide_sessions(id) ON DELETE SET NULL,
        title VARCHAR(255),
        messages JSONB DEFAULT '[]'::jsonb,
        model VARCHAR(100) DEFAULT 'anthropic/claude-3.5-sonnet',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON cloud_ide_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_files_session_id ON cloud_ide_files(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_terminal_session_id ON terminal_history(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mcp_servers_user_id ON mcp_servers(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id)`;

    res.json({
      success: true,
      data: {
        message: 'Database initialized successfully',
        tables: [
          'users',
          'cloud_ide_sessions',
          'cloud_ide_files',
          'terminal_history',
          'projects',
          'mcp_servers',
          'ai_conversations'
        ],
        indexes: [
          'idx_sessions_user_id',
          'idx_files_session_id',
          'idx_terminal_session_id',
          'idx_projects_user_id',
          'idx_mcp_servers_user_id',
          'idx_ai_conversations_user_id'
        ]
      }
    });
  } catch (error) {
    console.error('Database init error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DB_INIT_ERROR', message: error.message }
    });
  }
});

// ============================================================================
// AUTHENTICATION
// ============================================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User already exists' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [user] = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${hashedPassword}, ${name || email.split('@')[0]})
      RETURNING id, email, name, created_at
    `;

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create a default workspace session for the user
    await sql`
      INSERT INTO cloud_ide_sessions (user_id, name, description, status)
      VALUES (${user.id}, 'Default Workspace', 'Your default development workspace', 'running')
    `;

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token,
        message: 'Registration successful'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'REGISTER_ERROR', message: error.message }
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    // Update last login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          settings: user.settings
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'LOGIN_ERROR', message: error.message }
    });
  }
});

app.post('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, email, name, avatar_url, settings
      FROM users
      WHERE id = ${req.user.userId}
    `;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: { user, valid: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'VERIFY_ERROR', message: error.message }
    });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar_url, settings } = req.body;

    const [user] = await sql`
      UPDATE users
      SET
        name = COALESCE(${name}, name),
        avatar_url = COALESCE(${avatar_url}, avatar_url),
        settings = COALESCE(${settings ? JSON.stringify(settings) : null}::jsonb, settings)
      WHERE id = ${req.user.userId}
      RETURNING id, email, name, avatar_url, settings
    `;

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message }
    });
  }
});

// ============================================================================
// IDE SESSIONS
// ============================================================================

app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await sql`
      SELECT * FROM cloud_ide_sessions
      WHERE user_id = ${req.user.userId}
      ORDER BY last_active DESC
    `;

    res.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
});

app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { name, description, region, machineType } = req.body;

    const sessionId = randomUUID();
    const sessionUrl = `https://${name.toLowerCase().replace(/\s+/g, '-')}-${sessionId.slice(0, 8)}.run.app`;

    const [session] = await sql`
      INSERT INTO cloud_ide_sessions (id, user_id, name, description, region, machine_type, status, url)
      VALUES (
        ${sessionId},
        ${req.user.userId},
        ${name || 'New Workspace'},
        ${description || ''},
        ${region || 'australia-southeast1'},
        ${machineType || 'e2-standard-2'},
        'running',
        ${sessionUrl}
      )
      RETURNING *
    `;

    // Create default files for new session
    const defaultFiles = [
      { path: '/workspace/README.md', name: 'README.md', content: `# ${name || 'New Workspace'}\n\nWelcome to your cloud IDE workspace.`, type: 'file', language: 'markdown' },
      { path: '/workspace/src/index.ts', name: 'index.ts', content: `// ${name || 'New Workspace'}\nconsole.log('Hello from Cloud IDE!');`, type: 'file', language: 'typescript' },
      { path: '/workspace/package.json', name: 'package.json', content: JSON.stringify({ name: name?.toLowerCase().replace(/\s+/g, '-') || 'workspace', version: '1.0.0', main: 'src/index.ts' }, null, 2), type: 'file', language: 'json' }
    ];

    for (const file of defaultFiles) {
      await sql`
        INSERT INTO cloud_ide_files (session_id, path, name, content, type, language, size)
        VALUES (${sessionId}, ${file.path}, ${file.name}, ${file.content}, ${file.type}, ${file.language}, ${file.content.length})
        ON CONFLICT (session_id, path) DO NOTHING
      `;
    }

    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_ERROR', message: error.message }
    });
  }
});

app.put('/api/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, settings } = req.body;

    const [session] = await sql`
      UPDATE cloud_ide_sessions
      SET
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        status = COALESCE(${status}, status),
        settings = COALESCE(${settings ? JSON.stringify(settings) : null}::jsonb, settings),
        last_active = NOW()
      WHERE id = ${id} AND user_id = ${req.user.userId}
      RETURNING *
    `;

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Session not found' }
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message }
    });
  }
});

app.delete('/api/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await sql`
      DELETE FROM cloud_ide_sessions
      WHERE id = ${id} AND user_id = ${req.user.userId}
    `;

    res.json({
      success: true,
      data: { message: 'Session deleted' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_ERROR', message: error.message }
    });
  }
});

// ============================================================================
// FILE OPERATIONS
// ============================================================================

app.get('/api/files', authenticateToken, async (req, res) => {
  try {
    const { sessionId, path: filePath } = req.query;

    let files;
    if (sessionId) {
      files = await sql`
        SELECT * FROM cloud_ide_files
        WHERE session_id = ${sessionId}
        ${filePath ? sql`AND path LIKE ${filePath + '%'}` : sql``}
        ORDER BY type DESC, name ASC
      `;
    } else {
      // Get files from user's first session
      const [session] = await sql`
        SELECT id FROM cloud_ide_sessions
        WHERE user_id = ${req.user.userId}
        ORDER BY last_active DESC
        LIMIT 1
      `;

      if (session) {
        files = await sql`
          SELECT * FROM cloud_ide_files
          WHERE session_id = ${session.id}
          ORDER BY type DESC, name ASC
        `;
      } else {
        files = [];
      }
    }

    res.json({
      success: true,
      data: { files }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
});

app.get('/api/files/read', authenticateToken, async (req, res) => {
  try {
    const { path: filePath, sessionId } = req.query;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Path is required' }
      });
    }

    // Try database first
    let file;
    if (sessionId) {
      [file] = await sql`
        SELECT * FROM cloud_ide_files
        WHERE session_id = ${sessionId} AND path = ${filePath}
      `;
    } else {
      // Find from any of user's sessions
      [file] = await sql`
        SELECT f.* FROM cloud_ide_files f
        JOIN cloud_ide_sessions s ON f.session_id = s.id
        WHERE s.user_id = ${req.user.userId} AND f.path = ${filePath}
        LIMIT 1
      `;
    }

    if (file) {
      return res.json({
        success: true,
        data: {
          path: file.path,
          content: file.content,
          language: file.language,
          size: file.size,
          updated_at: file.updated_at
        }
      });
    }

    // Try Google Cloud Storage if database file not found
    try {
      const [content] = await bucket.file(filePath.replace(/^\//, '')).download();
      return res.json({
        success: true,
        data: {
          path: filePath,
          content: content.toString('utf-8'),
          language: detectLanguage(filePath)
        }
      });
    } catch {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'File not found' }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'READ_ERROR', message: error.message }
    });
  }
});

app.post('/api/files/write', authenticateToken, async (req, res) => {
  try {
    const { path: filePath, content, sessionId } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Path is required' }
      });
    }

    const fileName = filePath.split('/').pop();
    const language = detectLanguage(filePath);
    const size = content?.length || 0;

    // Get or create session
    let session;
    if (sessionId) {
      [session] = await sql`SELECT id FROM cloud_ide_sessions WHERE id = ${sessionId}`;
    } else {
      [session] = await sql`
        SELECT id FROM cloud_ide_sessions
        WHERE user_id = ${req.user.userId}
        ORDER BY last_active DESC
        LIMIT 1
      `;
    }

    if (!session) {
      // Create default session
      [session] = await sql`
        INSERT INTO cloud_ide_sessions (user_id, name, status)
        VALUES (${req.user.userId}, 'Default Workspace', 'running')
        RETURNING id
      `;
    }

    // Upsert file
    await sql`
      INSERT INTO cloud_ide_files (session_id, path, name, content, language, size, updated_at)
      VALUES (${session.id}, ${filePath}, ${fileName}, ${content || ''}, ${language}, ${size}, NOW())
      ON CONFLICT (session_id, path)
      DO UPDATE SET
        content = EXCLUDED.content,
        size = EXCLUDED.size,
        updated_at = NOW()
    `;

    // Also save to GCS if configured
    if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
      try {
        await bucket.file(filePath.replace(/^\//, '')).save(content || '');
      } catch (e) {
        console.log('GCS save skipped:', e.message);
      }
    }

    res.json({
      success: true,
      data: {
        path: filePath,
        saved: true,
        size,
        language
      }
    });
  } catch (error) {
    console.error('Write file error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'WRITE_ERROR', message: error.message }
    });
  }
});

app.delete('/api/files', authenticateToken, async (req, res) => {
  try {
    const { path: filePath, sessionId } = req.query;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Path is required' }
      });
    }

    if (sessionId) {
      await sql`
        DELETE FROM cloud_ide_files
        WHERE session_id = ${sessionId} AND path = ${filePath}
      `;
    } else {
      await sql`
        DELETE FROM cloud_ide_files f
        USING cloud_ide_sessions s
        WHERE f.session_id = s.id
          AND s.user_id = ${req.user.userId}
          AND f.path = ${filePath}
      `;
    }

    // Also delete from GCS if configured
    if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
      try {
        await bucket.file(filePath.replace(/^\//, '')).delete();
      } catch (e) {
        console.log('GCS delete skipped:', e.message);
      }
    }

    res.json({
      success: true,
      data: { path: filePath, deleted: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_ERROR', message: error.message }
    });
  }
});

app.get('/api/files/tree', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.query;

    let files;
    if (sessionId) {
      files = await sql`
        SELECT path, name, type, language
        FROM cloud_ide_files
        WHERE session_id = ${sessionId}
        ORDER BY path
      `;
    } else {
      const [session] = await sql`
        SELECT id FROM cloud_ide_sessions
        WHERE user_id = ${req.user.userId}
        ORDER BY last_active DESC
        LIMIT 1
      `;

      if (session) {
        files = await sql`
          SELECT path, name, type, language
          FROM cloud_ide_files
          WHERE session_id = ${session.id}
          ORDER BY path
        `;
      } else {
        files = [];
      }
    }

    // Build tree structure
    const tree = buildFileTree(files);

    res.json({
      success: true,
      data: { tree }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'TREE_ERROR', message: error.message }
    });
  }
});

// ============================================================================
// TERMINAL SERVICE
// ============================================================================

app.post('/api/terminal/execute', authenticateToken, async (req, res) => {
  try {
    const { command, sessionId, workingDir } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Command is required' }
      });
    }

    let output = '';
    let exitCode = 0;

    // Simulate safe terminal commands
    const cmd = command.trim();

    // Safe command whitelist with simulated outputs
    const safeCommands = {
      'help': 'Available commands: ls, pwd, cat, echo, npm, node, git, clear, whoami, date, env',
      'pwd': workingDir || '/workspace',
      'whoami': 'cloud-ide-user',
      'date': new Date().toString(),
      'ls': 'src/  node_modules/  package.json  README.md  CLAUDE.md  tsconfig.json',
      'ls -la': 'total 48\ndrwxr-xr-x  6 user user 4096 Dec 26 12:00 .\ndrwxr-xr-x  3 user user 4096 Dec 26 12:00 ..\n-rw-r--r--  1 user user  256 Dec 26 12:00 package.json\n-rw-r--r--  1 user user 1024 Dec 26 12:00 README.md\ndrwxr-xr-x  3 user user 4096 Dec 26 12:00 src',
      'node --version': 'v20.10.0',
      'npm --version': '10.2.4',
      'git --version': 'git version 2.43.0',
      'clear': '',
      'env': 'NODE_ENV=development\nPATH=/usr/local/bin:/usr/bin:/bin\nHOME=/workspace\nSHELL=/bin/bash'
    };

    if (safeCommands[cmd]) {
      output = safeCommands[cmd];
    } else if (cmd.startsWith('echo ')) {
      output = cmd.substring(5);
    } else if (cmd.startsWith('cat ')) {
      const filePath = cmd.substring(4).trim();
      const [file] = await sql`
        SELECT content FROM cloud_ide_files f
        JOIN cloud_ide_sessions s ON f.session_id = s.id
        WHERE s.user_id = ${req.user.userId} AND f.path LIKE ${'%' + filePath}
        LIMIT 1
      `;
      output = file ? file.content : `cat: ${filePath}: No such file or directory`;
      exitCode = file ? 0 : 1;
    } else if (cmd.startsWith('npm ')) {
      output = `npm: Running '${cmd}'...\n[simulated output]`;
    } else if (cmd.startsWith('git ')) {
      const gitCmd = cmd.substring(4);
      if (gitCmd === 'status') {
        output = 'On branch main\nYour branch is up to date.\n\nnothing to commit, working tree clean';
      } else if (gitCmd === 'log --oneline -5') {
        output = 'abc1234 Latest commit\ndef5678 Previous commit\nghi9012 Initial setup';
      } else {
        output = `git: executing '${gitCmd}'...`;
      }
    } else if (cmd.startsWith('mkdir ') || cmd.startsWith('touch ')) {
      output = `Created: ${cmd.split(' ')[1]}`;
    } else {
      output = `$ ${cmd}\nCommand executed (simulated)`;
    }

    // Log to terminal history
    if (sessionId) {
      await sql`
        INSERT INTO terminal_history (session_id, user_id, command, output, exit_code, working_dir)
        VALUES (${sessionId}, ${req.user.userId}, ${cmd}, ${output}, ${exitCode}, ${workingDir || '/workspace'})
      `;
    }

    res.json({
      success: true,
      data: { command: cmd, output, exitCode }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'EXEC_ERROR', message: error.message }
    });
  }
});

app.get('/api/terminal/history', authenticateToken, async (req, res) => {
  try {
    const { sessionId, limit = 50 } = req.query;

    const history = await sql`
      SELECT command, output, exit_code, working_dir, created_at
      FROM terminal_history
      WHERE user_id = ${req.user.userId}
      ${sessionId ? sql`AND session_id = ${sessionId}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)}
    `;

    res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'HISTORY_ERROR', message: error.message }
    });
  }
});

// ============================================================================
// AI SERVICE PROXY
// ============================================================================

app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { messages, model = 'anthropic/claude-3.5-sonnet', stream = false } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Messages array is required' }
      });
    }

    if (!OPENROUTER_API_KEY) {
      // Return simulated response if no API key
      return res.json({
        success: true,
        data: {
          content: 'AI response (OpenRouter API key not configured). To enable AI features, set OPENROUTER_API_KEY environment variable.',
          model,
          usage: { prompt_tokens: 0, completion_tokens: 0 }
        }
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agent-builder.run.app',
        'X-Title': 'Agent Builder IDE'
      },
      body: JSON.stringify({
        model,
        messages,
        stream
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: { code: 'AI_ERROR', message: data.error?.message || 'AI request failed' }
      });
    }

    res.json({
      success: true,
      data: {
        content: data.choices?.[0]?.message?.content || '',
        model: data.model,
        usage: data.usage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: error.message }
    });
  }
});

app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, model = 'anthropic/claude-3-haiku' } = req.body;

    if (!OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        data: {
          content: 'AI generation requires OpenRouter API key configuration.',
          model
        }
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    res.json({
      success: true,
      data: {
        content: data.choices?.[0]?.message?.content || '',
        model: data.model
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'GENERATE_ERROR', message: error.message }
    });
  }
});

app.get('/api/ai/models', async (req, res) => {
  res.json({
    success: true,
    data: {
      models: [
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', context: 200000 },
        { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', context: 200000 },
        { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', context: 200000 },
        { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', context: 128000 },
        { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: 128000 },
        { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google', context: 32000 },
        { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', context: 128000 }
      ]
    }
  });
});

// ============================================================================
// PROJECTS
// ============================================================================

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await sql`
      SELECT * FROM projects
      WHERE user_id = ${req.user.userId}
      ORDER BY updated_at DESC
    `;

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, template, github_url, settings } = req.body;

    const [project] = await sql`
      INSERT INTO projects (user_id, name, description, template, github_url, settings)
      VALUES (
        ${req.user.userId},
        ${name},
        ${description || ''},
        ${template || 'blank'},
        ${github_url || null},
        ${settings ? JSON.stringify(settings) : '{}'}::jsonb
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: { project }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_ERROR', message: error.message }
    });
  }
});

// ============================================================================
// MCP SERVERS
// ============================================================================

app.get('/api/mcp/servers', authenticateToken, async (req, res) => {
  try {
    const servers = await sql`
      SELECT * FROM mcp_servers
      WHERE user_id = ${req.user.userId}
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: { servers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
});

app.post('/api/mcp/servers', authenticateToken, async (req, res) => {
  try {
    const { name, type, config, enabled = true } = req.body;

    const [server] = await sql`
      INSERT INTO mcp_servers (user_id, name, type, config, enabled)
      VALUES (
        ${req.user.userId},
        ${name},
        ${type},
        ${JSON.stringify(config)}::jsonb,
        ${enabled}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: { server }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_ERROR', message: error.message }
    });
  }
});

app.put('/api/mcp/servers/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, config, enabled } = req.body;

    const [server] = await sql`
      UPDATE mcp_servers
      SET
        name = COALESCE(${name}, name),
        config = COALESCE(${config ? JSON.stringify(config) : null}::jsonb, config),
        enabled = COALESCE(${enabled}, enabled),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${req.user.userId}
      RETURNING *
    `;

    if (!server) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'MCP server not found' }
      });
    }

    res.json({
      success: true,
      data: { server }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message }
    });
  }
});

app.delete('/api/mcp/servers/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await sql`
      DELETE FROM mcp_servers
      WHERE id = ${id} AND user_id = ${req.user.userId}
    `;

    res.json({
      success: true,
      data: { message: 'MCP server deleted' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_ERROR', message: error.message }
    });
  }
});

// ============================================================================
// SCRIPT GENERATOR
// ============================================================================

app.post('/api/scripts/generate', authenticateToken, async (req, res) => {
  try {
    const { agentConfig, outputFormat = 'shell' } = req.body;

    const agentName = agentConfig?.name || 'my-agent';
    const tools = agentConfig?.tools || [];

    let script = '';
    let filename = '';
    let language = '';

    if (outputFormat === 'shell') {
      filename = 'setup.sh';
      language = 'bash';
      script = `#!/bin/bash
# Auto-generated setup script for ${agentName}
# Generated at: ${new Date().toISOString()}

set -e

echo "🚀 Setting up ${agentName}..."

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "Node.js is required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }

# Create project directory
mkdir -p ${agentName}
cd ${agentName}

# Initialize project
npm init -y

# Install core dependencies
npm install @anthropic-ai/sdk @modelcontextprotocol/sdk

${tools.map(t => `# Tool: ${t.name}\nnpm install ${t.package || t.name}`).join('\n\n')}

# Create CLAUDE.md
cat > CLAUDE.md << 'EOF'
# ${agentName}

## Identity
AI agent configured with MCP tools.

## Tools
${tools.map(t => `- ${t.name}: ${t.description || 'No description'}`).join('\n')}
EOF

echo "✅ Setup complete!"
echo "Run 'claude' to start the agent."
`;
    } else if (outputFormat === 'powershell') {
      filename = 'setup.ps1';
      language = 'powershell';
      script = `# Auto-generated setup script for ${agentName}
# Generated at: ${new Date().toISOString()}

Write-Host "🚀 Setting up ${agentName}..." -ForegroundColor Cyan

# Create project directory
New-Item -ItemType Directory -Force -Path "${agentName}"
Set-Location "${agentName}"

# Initialize project
npm init -y

# Install dependencies
npm install @anthropic-ai/sdk @modelcontextprotocol/sdk

Write-Host "✅ Setup complete!" -ForegroundColor Green
`;
    } else if (outputFormat === 'claudemd') {
      filename = 'CLAUDE.md';
      language = 'markdown';
      script = `# ${agentName}

## Identity
${agentConfig?.identity || 'AI agent built with Claude and MCP.'}

## Instructions
${agentConfig?.instructions || '- Follow user requests carefully\n- Use available tools when needed\n- Provide clear explanations'}

## Tools
${tools.map(t => `### ${t.name}
${t.description || 'No description'}
${t.config ? `\`\`\`json\n${JSON.stringify(t.config, null, 2)}\n\`\`\`` : ''}`).join('\n\n')}

## Context
- Created: ${new Date().toISOString()}
- Region: australia-southeast1
`;
    }

    res.json({
      success: true,
      data: { script, filename, language }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'GENERATE_ERROR', message: error.message }
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function detectLanguage(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'r': 'r',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'ps1': 'powershell',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'md': 'markdown',
    'markdown': 'markdown',
    'txt': 'plaintext',
    'dockerfile': 'dockerfile',
    'makefile': 'makefile',
    'toml': 'toml',
    'ini': 'ini',
    'cfg': 'ini',
    'env': 'dotenv'
  };
  return languageMap[ext] || 'plaintext';
}

function buildFileTree(files) {
  const tree = {
    name: 'workspace',
    type: 'folder',
    path: '/workspace',
    children: []
  };

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
}

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                 AGENT BUILDER BACKEND                       ║
╠══════════════════════════════════════════════════════════════╣
║  Server:     http://0.0.0.0:${PORT}                           ║
║  Database:   Neon PostgreSQL                                 ║
║  Storage:    Google Cloud Storage                            ║
║  Region:     ${(process.env.REGION || 'australia-southeast1').padEnd(35)}║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await sql.end();
  process.exit(0);
});

export default app;

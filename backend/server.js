import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Storage } from '@google-cloud/storage';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'agent-builder-secret-key';

// Neon DB connection
const sql = postgres(process.env.NEON_DB_CONNECTION_STRING || '');

// Google Cloud Storage
const storage = new Storage({ projectId: process.env.GOOGLE_CLOUD_PROJECT_ID });
const bucket = storage.bucket(process.env.CLOUD_STORAGE_BUCKET || 'agent-builder-ide-files');

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${hashedPassword}, ${name})
      RETURNING id, email, name
    `;
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File operations
app.get('/api/files', async (req, res) => {
  try {
    const prefix = req.query.path || '';
    const [files] = await bucket.getFiles({ prefix });
    const fileList = files.map(f => ({
      name: f.name,
      size: f.metadata.size,
      updated: f.metadata.updated
    }));
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/read', async (req, res) => {
  try {
    const filePath = req.query.path;
    const [content] = await bucket.file(filePath).download();
    res.json({ content: content.toString('utf-8') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/files/write', async (req, res) => {
  try {
    const { path, content } = req.body;
    await bucket.file(path).save(content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/files', async (req, res) => {
  try {
    const filePath = req.query.path;
    await bucket.file(filePath).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Terminal service
app.post('/api/terminal/execute', async (req, res) => {
  try {
    const { command, userId } = req.body;
    await sql`INSERT INTO terminal_history (user_id, command) VALUES (${userId}, ${command})`;
    // Simulated command output
    const output = `Executed: ${command}\nOutput: Command completed successfully.`;
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI service proxy
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

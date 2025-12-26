// Cloud IDE API Client - Connects frontend to backend services

// API endpoints - will be replaced with actual Supabase function URLs after deployment
const API_BASE = import.meta.env.VITE_API_BASE || '';

// Determine if we're using Supabase functions or local simulation
const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL);

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

// Auth API
export const authApi = {
  async register(email: string, password: string, name?: string): Promise<ApiResponse<{ user: any; token: string }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neon-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, name })
      });
      return res.json();
    }
    // Local simulation
    const userId = crypto.randomUUID();
    const token = btoa(JSON.stringify({ userId, email, exp: Date.now() + 86400000 }));
    return {
      success: true,
      data: {
        user: { id: userId, email, name: name || email.split('@')[0] },
        token
      }
    };
  },

  async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neon-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      return res.json();
    }
    const userId = crypto.randomUUID();
    const token = btoa(JSON.stringify({ userId, email, exp: Date.now() + 86400000 }));
    return {
      success: true,
      data: {
        user: { id: userId, email, name: email.split('@')[0] },
        token
      }
    };
  },

  async verify(token: string): Promise<ApiResponse<{ user: any; valid: boolean }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neon-auth`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'verify' })
      });
      return res.json();
    }
    try {
      const payload = JSON.parse(atob(token));
      return { success: true, data: { user: payload, valid: payload.exp > Date.now() } };
    } catch {
      return { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid token' } };
    }
  }
};

// File Operations API
export const fileApi = {
  async list(sessionId?: string): Promise<ApiResponse<{ files: any[] }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/file-operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list', sessionId })
      });
      return res.json();
    }
    return {
      success: true,
      data: {
        files: [
          { path: '/workspace/src/main.ts', name: 'main.ts', type: 'file', language: 'typescript' },
          { path: '/workspace/src/App.tsx', name: 'App.tsx', type: 'file', language: 'typescript' },
          { path: '/workspace/package.json', name: 'package.json', type: 'file', language: 'json' },
          { path: '/workspace/CLAUDE.md', name: 'CLAUDE.md', type: 'file', language: 'markdown' }
        ]
      }
    };
  },

  async read(path: string): Promise<ApiResponse<{ path: string; content: string; language: string }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/file-operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', path })
      });
      return res.json();
    }
    // Local file content simulation
    const contents: Record<string, { content: string; language: string }> = {
      '/workspace/src/main.ts': {
        content: `import { createApp } from './App';\n\nconst app = createApp();\napp.listen(3000);`,
        language: 'typescript'
      },
      '/workspace/src/App.tsx': {
        content: `import React from 'react';\n\nexport function App() {\n  return <div>Cloud IDE</div>;\n}`,
        language: 'typescript'
      },
      '/workspace/package.json': {
        content: `{\n  "name": "cloud-ide",\n  "version": "1.0.0"\n}`,
        language: 'json'
      },
      '/workspace/CLAUDE.md': {
        content: `# Cloud IDE\n\n## IDENTITY\nCloud development environment.`,
        language: 'markdown'
      }
    };
    const file = contents[path];
    if (!file) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'File not found' } };
    }
    return { success: true, data: { path, ...file } };
  },

  async write(path: string, content: string): Promise<ApiResponse<{ path: string; saved: boolean }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/file-operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'write', path, content })
      });
      return res.json();
    }
    return { success: true, data: { path, saved: true } };
  },

  async getTree(): Promise<ApiResponse<{ tree: any }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/file-operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tree' })
      });
      return res.json();
    }
    return {
      success: true,
      data: {
        tree: {
          name: 'workspace',
          type: 'folder',
          children: [
            {
              name: 'src',
              type: 'folder',
              children: [
                { name: 'main.ts', type: 'file', path: '/workspace/src/main.ts' },
                { name: 'App.tsx', type: 'file', path: '/workspace/src/App.tsx' }
              ]
            },
            { name: 'package.json', type: 'file', path: '/workspace/package.json' },
            { name: 'CLAUDE.md', type: 'file', path: '/workspace/CLAUDE.md' }
          ]
        }
      }
    };
  }
};

// Terminal API
export const terminalApi = {
  async execute(command: string, sessionId?: string, workingDir?: string): Promise<ApiResponse<{
    command: string;
    output: string;
    exitCode: number;
  }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/terminal-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, sessionId, workingDir })
      });
      return res.json();
    }
    // Local command simulation
    const cmd = command.trim();
    let output = '';
    let exitCode = 0;

    if (cmd === 'help') {
      output = 'Available: ls, pwd, cat, echo, npm, git, node, clear';
    } else if (cmd === 'pwd') {
      output = workingDir || '/workspace';
    } else if (cmd === 'ls') {
      output = 'src/  package.json  CLAUDE.md';
    } else if (cmd === 'node --version') {
      output = 'v20.10.0';
    } else if (cmd.startsWith('npm ')) {
      output = `Executing: ${cmd}...`;
    } else if (cmd.startsWith('git ')) {
      output = `git: ${cmd.substring(4)}`;
    } else {
      output = `$ ${cmd}`;
    }

    return { success: true, data: { command: cmd, output, exitCode } };
  }
};

// Script Generator API
export const scriptApi = {
  async generate(agentConfig: any, outputFormat: 'shell' | 'powershell' | 'claudemd' = 'shell'): Promise<ApiResponse<{
    script: string;
    filename: string;
    language: string;
  }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentConfig, outputFormat })
      });
      return res.json();
    }
    // Local generation
    const script = `#!/bin/bash\n# Setup for ${agentConfig.name || 'My Agent'}\necho "Setting up..."`;
    return {
      success: true,
      data: { script, filename: 'setup.sh', language: 'bash' }
    };
  }
};

// AI Service API
export const aiApi = {
  async chat(messages: Array<{ role: string; content: string }>, model?: string): Promise<ApiResponse<{
    content: string;
    model: string;
  }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-service-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', messages, model })
      });
      return res.json();
    }
    return {
      success: true,
      data: { content: 'AI response (requires backend)', model: model || 'claude-3.5-sonnet' }
    };
  },

  async analyzeCode(code: string): Promise<ApiResponse<{ analysis: string }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-service-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze-code', code })
      });
      return res.json();
    }
    return { success: true, data: { analysis: 'Code analysis requires backend connection' } };
  },

  async getModels(): Promise<ApiResponse<{ models: Array<{ id: string; name: string; provider: string }> }>> {
    if (USE_SUPABASE) {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-service-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'models' })
      });
      return res.json();
    }
    return {
      success: true,
      data: {
        models: [
          { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
          { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' }
        ]
      }
    };
  }
};

// WebSocket Uplink Connection
export class UplinkWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private url?: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.url || import.meta.env.VITE_WS_URL || 'wss://realtime.supabase.co';
      
      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.emit('connected', { timestamp: Date.now() });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit(data.type || 'message', data);
          } catch {
            this.emit('message', { raw: event.data });
          }
        };

        this.ws.onerror = (error) => {
          this.emit('error', { error });
        };

        this.ws.onclose = () => {
          this.emit('disconnected', { timestamp: Date.now() });
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const uplink = new UplinkWebSocket();

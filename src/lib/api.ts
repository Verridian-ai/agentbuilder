// Cloud IDE API Client - Connects frontend to Google Cloud backend with Neon DB

// API configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const USE_SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL);

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

// Fetch wrapper with auth headers
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || { code: 'API_ERROR', message: response.statusText }
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: (error as Error).message }
    };
  }
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  async register(email: string, password: string, name?: string): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await apiFetch<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });

    if (response.success && response.data?.token) {
      setToken(response.data.token);
    }

    return response;
  },

  async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await apiFetch<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success && response.data?.token) {
      setToken(response.data.token);
    }

    return response;
  },

  async verify(): Promise<ApiResponse<{ user: any; valid: boolean }>> {
    const token = getToken();
    if (!token) {
      return { success: false, error: { code: 'NO_TOKEN', message: 'No authentication token' } };
    }
    return apiFetch('/api/auth/verify', { method: 'POST' });
  },

  async updateProfile(data: { name?: string; avatar_url?: string; settings?: any }): Promise<ApiResponse<{ user: any }>> {
    return apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  logout(): void {
    removeToken();
  },

  isAuthenticated(): boolean {
    return Boolean(getToken());
  }
};

// ============================================================================
// DATABASE API
// ============================================================================

export const databaseApi = {
  async initialize(): Promise<ApiResponse<{ message: string; tables: string[] }>> {
    return apiFetch('/api/db/init', { method: 'POST' });
  },

  async status(): Promise<ApiResponse<any>> {
    return apiFetch('/api/status');
  },

  async health(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  }
};

// ============================================================================
// SESSION API
// ============================================================================

export const sessionApi = {
  async list(): Promise<ApiResponse<{ sessions: any[] }>> {
    return apiFetch('/api/sessions');
  },

  async create(data: {
    name: string;
    description?: string;
    region?: string;
    machineType?: string;
  }): Promise<ApiResponse<{ session: any }>> {
    return apiFetch('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id: string, data: {
    name?: string;
    description?: string;
    status?: string;
    settings?: any;
  }): Promise<ApiResponse<{ session: any }>> {
    return apiFetch(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiFetch(`/api/sessions/${id}`, { method: 'DELETE' });
  }
};

// ============================================================================
// FILE API
// ============================================================================

export const fileApi = {
  async list(sessionId?: string): Promise<ApiResponse<{ files: any[] }>> {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    return apiFetch(`/api/files${params}`);
  },

  async read(path: string, sessionId?: string): Promise<ApiResponse<{ path: string; content: string; language: string }>> {
    const params = new URLSearchParams({ path });
    if (sessionId) params.append('sessionId', sessionId);
    return apiFetch(`/api/files/read?${params}`);
  },

  async write(path: string, content: string, sessionId?: string): Promise<ApiResponse<{ path: string; saved: boolean }>> {
    return apiFetch('/api/files/write', {
      method: 'POST',
      body: JSON.stringify({ path, content, sessionId })
    });
  },

  async delete(path: string, sessionId?: string): Promise<ApiResponse<{ path: string; deleted: boolean }>> {
    const params = new URLSearchParams({ path });
    if (sessionId) params.append('sessionId', sessionId);
    return apiFetch(`/api/files?${params}`, { method: 'DELETE' });
  },

  async getTree(sessionId?: string): Promise<ApiResponse<{ tree: any }>> {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    return apiFetch(`/api/files/tree${params}`);
  },

  // Local simulation fallbacks
  async listLocal(): Promise<ApiResponse<{ files: any[] }>> {
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
  }
};

// ============================================================================
// TERMINAL API
// ============================================================================

export const terminalApi = {
  async execute(command: string, sessionId?: string, workingDir?: string): Promise<ApiResponse<{
    command: string;
    output: string;
    exitCode: number;
  }>> {
    return apiFetch('/api/terminal/execute', {
      method: 'POST',
      body: JSON.stringify({ command, sessionId, workingDir })
    });
  },

  async history(sessionId?: string, limit = 50): Promise<ApiResponse<{ history: any[] }>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (sessionId) params.append('sessionId', sessionId);
    return apiFetch(`/api/terminal/history?${params}`);
  }
};

// ============================================================================
// AI API
// ============================================================================

export const aiApi = {
  async chat(messages: Array<{ role: string; content: string }>, model?: string): Promise<ApiResponse<{
    content: string;
    model: string;
    usage?: any;
  }>> {
    return apiFetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, model })
    });
  },

  async generate(prompt: string, model?: string): Promise<ApiResponse<{ content: string; model: string }>> {
    return apiFetch('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, model })
    });
  },

  async getModels(): Promise<ApiResponse<{ models: Array<{ id: string; name: string; provider: string; context?: number }> }>> {
    return apiFetch('/api/ai/models');
  },

  async analyzeCode(code: string): Promise<ApiResponse<{ analysis: string }>> {
    return apiFetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Analyze this code and provide insights:\n\n${code}` }],
        model: 'anthropic/claude-3-haiku'
      })
    });
  }
};

// ============================================================================
// PROJECTS API
// ============================================================================

export const projectsApi = {
  async list(): Promise<ApiResponse<{ projects: any[] }>> {
    return apiFetch('/api/projects');
  },

  async create(data: {
    name: string;
    description?: string;
    template?: string;
    github_url?: string;
    settings?: any;
  }): Promise<ApiResponse<{ project: any }>> {
    return apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// ============================================================================
// MCP SERVERS API
// ============================================================================

export const mcpApi = {
  async list(): Promise<ApiResponse<{ servers: any[] }>> {
    return apiFetch('/api/mcp/servers');
  },

  async create(data: {
    name: string;
    type: string;
    config: any;
    enabled?: boolean;
  }): Promise<ApiResponse<{ server: any }>> {
    return apiFetch('/api/mcp/servers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id: string, data: {
    name?: string;
    config?: any;
    enabled?: boolean;
  }): Promise<ApiResponse<{ server: any }>> {
    return apiFetch(`/api/mcp/servers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiFetch(`/api/mcp/servers/${id}`, { method: 'DELETE' });
  }
};

// ============================================================================
// SCRIPT GENERATOR API
// ============================================================================

export const scriptApi = {
  async generate(agentConfig: any, outputFormat: 'shell' | 'powershell' | 'claudemd' = 'shell'): Promise<ApiResponse<{
    script: string;
    filename: string;
    language: string;
  }>> {
    return apiFetch('/api/scripts/generate', {
      method: 'POST',
      body: JSON.stringify({ agentConfig, outputFormat })
    });
  }
};

// ============================================================================
// WEBSOCKET UPLINK CONNECTION
// ============================================================================

export class UplinkWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private url?: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.url || import.meta.env.VITE_WS_URL || 'wss://realtime.supabase.co';

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.startHeartbeat();
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
          this.stopHeartbeat();
          this.emit('disconnected', { timestamp: Date.now() });
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
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
    return () => this.off(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  disconnect() {
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'closed';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}

// Export singleton instance
export const uplink = new UplinkWebSocket();

// ============================================================================
// LEGACY COMPATIBILITY EXPORTS
// ============================================================================

// For backward compatibility with existing code that uses USE_SUPABASE pattern
export { API_BASE, USE_SUPABASE, getToken, setToken, removeToken };

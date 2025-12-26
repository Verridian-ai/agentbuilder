// File Operations - Cloud Storage file management with Neon DB metadata
const NEON_DB_URL = 'postgresql://neondb_owner:npg_rQvf5D0HGxBw@ep-aged-sky-a7p3va5h-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require';
const STORAGE_BUCKET = 'agent-builder-ide-files';

// In-memory file storage (simulates Cloud Storage)
const fileStorage = new Map<string, { content: string; language: string; updatedAt: string }>();

// Initialize with default project files
const defaultFiles: Record<string, { content: string; language: string }> = {
  '/workspace/src/main.ts': {
    content: `import { createApp } from './App';
import { initializeServices } from './utils';

// Initialize all cloud services
initializeServices();

const app = createApp();

app.listen(3000, () => {
  console.log('Agent Builder Platform running on port 3000');
  console.log('Connected to Google Cloud Run');
});

export { app };`,
    language: 'typescript'
  },
  '/workspace/src/App.tsx': {
    content: `import React, { useState, useEffect } from 'react';
import { CloudProvider } from './providers/CloudProvider';
import { AuthProvider } from './providers/AuthProvider';

interface AppState {
  status: 'loading' | 'ready' | 'error';
  user: any | null;
}

export function App() {
  const [state, setState] = useState<AppState>({ status: 'loading', user: null });

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize cloud connection
        await new Promise(resolve => setTimeout(resolve, 500));
        setState({ status: 'ready', user: null });
      } catch (error) {
        setState({ status: 'error', user: null });
      }
    };
    init();
  }, []);

  return (
    <AuthProvider>
      <CloudProvider>
        <div className="app min-h-screen bg-gray-900 text-white">
          <header className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold">Agent Builder Platform</h1>
            <span className="text-sm text-gray-400">Status: {state.status}</span>
          </header>
          <main className="p-4">
            <p>Cloud IDE powered by Google Cloud Run and Neon DB</p>
          </main>
        </div>
      </CloudProvider>
    </AuthProvider>
  );
}

export function createApp() {
  return {
    listen: (port: number, callback: () => void) => callback()
  };
}`,
    language: 'typescript'
  },
  '/workspace/src/utils.ts': {
    content: `// Cloud IDE Utility Functions

export function initializeServices(): void {
  console.log('Initializing cloud services...');
  initializeNeonDB();
  initializeCloudStorage();
  initializeWebSocket();
}

function initializeNeonDB(): void {
  console.log('Connecting to Neon PostgreSQL...');
  // Connection established via environment variables
}

function initializeCloudStorage(): void {
  console.log('Connecting to Google Cloud Storage...');
  // Bucket: agent-builder-ide-files
}

function initializeWebSocket(): void {
  console.log('Establishing WebSocket uplink...');
  // Real-time sync enabled
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function generateId(): string {
  return crypto.randomUUID();
}`,
    language: 'typescript'
  },
  '/workspace/package.json': {
    content: `{
  "name": "agent-builder-platform",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "gcloud run deploy agent-builder-platform --source ."
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@neondatabase/serverless": "^0.9.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}`,
    language: 'json'
  },
  '/workspace/CLAUDE.md': {
    content: `# Agent Builder Platform

## IDENTITY
Cloud-hosted agent development platform powered by Google Cloud Run and Neon PostgreSQL.
Provides a full VS Code experience in the browser with real-time collaboration.

## ARCHITECTURE
- **Frontend**: React + TypeScript + Vite
- **Backend**: Google Cloud Run (code-server)
- **Database**: Neon PostgreSQL (serverless)
- **Storage**: Google Cloud Storage
- **Auth**: Neon Auth (no email confirmation)
- **AI**: OpenRouter API integration

## WORKFLOW
1. Users register/login via Neon Auth (instant, no email verification)
2. Create cloud IDE sessions on Google Cloud Run
3. Edit code in browser-based VS Code
4. Files sync to Google Cloud Storage
5. Real-time collaboration via WebSocket uplink
6. Deploy directly to production

## COMMANDS
- npm run dev - Start development server
- npm run build - Build for production  
- npm run deploy - Deploy to Cloud Run

## ENVIRONMENT
- Region: australia-southeast1
- Memory: 4Gi
- CPU: 4 vCPUs
- Timeout: 300s`,
    language: 'markdown'
  },
  '/workspace/tsconfig.json': {
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
    language: 'json'
  },
  '/workspace/.env': {
    content: `# Agent Builder Platform Configuration
VITE_API_URL=https://agent-builder-platform.run.app
VITE_WS_URL=wss://agent-builder-platform.run.app/ws

# Neon Database
NEON_DB_CONNECTION_STRING=postgresql://neondb_owner:***@ep-aged-sky-a7p3va5h-pooler.ap-southeast-2.aws.neon.tech/neondb

# Google Cloud
GOOGLE_CLOUD_PROJECT=agent-builder-482410
GOOGLE_CLOUD_REGION=australia-southeast1
CLOUD_STORAGE_BUCKET=agent-builder-ide-files

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-***`,
    language: 'env'
  }
};

// Initialize storage
for (const [path, file] of Object.entries(defaultFiles)) {
  fileStorage.set(path, { ...file, updatedAt: new Date().toISOString() });
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, path, content, sessionId, newPath } = await req.json();

    // LIST files
    if (action === 'list') {
      const files = Array.from(fileStorage.entries()).map(([filePath, data]) => ({
        path: filePath,
        name: filePath.split('/').pop(),
        type: 'file',
        language: data.language,
        size: data.content.length,
        updatedAt: data.updatedAt
      }));

      return new Response(JSON.stringify({
        success: true,
        data: { files, count: files.length }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // READ file
    if (action === 'read') {
      if (!path) throw new Error('Path is required');
      
      const file = fileStorage.get(path);
      if (!file) {
        throw new Error(`File not found: ${path}`);
      }

      return new Response(JSON.stringify({
        success: true,
        data: { 
          path, 
          content: file.content, 
          language: file.language,
          size: file.content.length,
          updatedAt: file.updatedAt
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // WRITE file
    if (action === 'write') {
      if (!path) throw new Error('Path is required');
      if (content === undefined) throw new Error('Content is required');

      const existingFile = fileStorage.get(path);
      const language = existingFile?.language || detectLanguage(path);
      
      fileStorage.set(path, {
        content,
        language,
        updatedAt: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        success: true,
        data: { 
          path, 
          saved: true, 
          size: content.length,
          language,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE file
    if (action === 'delete') {
      if (!path) throw new Error('Path is required');

      const existed = fileStorage.has(path);
      fileStorage.delete(path);

      return new Response(JSON.stringify({
        success: true,
        data: { path, deleted: existed }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // RENAME/MOVE file
    if (action === 'rename' || action === 'move') {
      if (!path || !newPath) throw new Error('Path and newPath are required');

      const file = fileStorage.get(path);
      if (!file) {
        throw new Error(`File not found: ${path}`);
      }

      fileStorage.delete(path);
      fileStorage.set(newPath, { ...file, updatedAt: new Date().toISOString() });

      return new Response(JSON.stringify({
        success: true,
        data: { oldPath: path, newPath, moved: true }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET file tree
    if (action === 'tree') {
      const tree = buildFileTree(Array.from(fileStorage.keys()));

      return new Response(JSON.stringify({
        success: true,
        data: { tree }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // SEARCH files
    if (action === 'search') {
      const { query } = await req.json();
      if (!query) throw new Error('Search query is required');

      const results: Array<{ path: string; line: number; content: string }> = [];
      
      for (const [filePath, file] of fileStorage.entries()) {
        const lines = file.content.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              path: filePath,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        data: { results, count: results.length }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error(`Invalid action: ${action}`);

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'FILE_ERROR', message: error.message }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    'ts': 'typescript', 'tsx': 'typescript', 'js': 'javascript', 'jsx': 'javascript',
    'json': 'json', 'md': 'markdown', 'css': 'css', 'html': 'html',
    'py': 'python', 'rs': 'rust', 'go': 'go', 'env': 'env'
  };
  return langMap[ext || ''] || 'text';
}

function buildFileTree(paths: string[]): any {
  const root: any = { name: 'workspace', type: 'folder', children: [] };
  
  for (const path of paths) {
    const parts = path.replace('/workspace/', '').split('/');
    let current = root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      
      let child = current.children?.find((c: any) => c.name === part);
      
      if (!child) {
        child = isFile 
          ? { name: part, type: 'file', path }
          : { name: part, type: 'folder', children: [] };
        current.children = current.children || [];
        current.children.push(child);
      }
      
      if (!isFile) current = child;
    }
  }
  
  return root;
}

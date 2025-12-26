// File Operations - IDE file management with simulated cloud storage
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
    const { action, path, content, sessionId } = await req.json();

    // In-memory file system simulation (would use Cloud Storage in production)
    const defaultFiles: Record<string, { content: string; type: string; language: string }> = {
      '/workspace/src/main.ts': {
        content: `import { createApp } from './App';
import { initializeServices } from './utils';

initializeServices();
const app = createApp();

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
        type: 'file',
        language: 'typescript'
      },
      '/workspace/src/App.tsx': {
        content: `import React, { useState, useEffect } from 'react';

export function App() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('ready');
    };
    init();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Cloud IDE Project</h1>
        <span className="status">{status}</span>
      </header>
    </div>
  );
}`,
        type: 'file',
        language: 'typescript'
      },
      '/workspace/package.json': {
        content: `{
  "name": "cloud-ide-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`,
        type: 'file',
        language: 'json'
      },
      '/workspace/CLAUDE.md': {
        content: `# Cloud IDE Project

## IDENTITY
Cloud-hosted development environment.

## WORKFLOW
1. Edit code in browser
2. Save to cloud storage
3. Build and deploy`,
        type: 'file',
        language: 'markdown'
      }
    };

    if (action === 'list') {
      const files = Object.keys(defaultFiles).map(filePath => ({
        path: filePath,
        name: filePath.split('/').pop(),
        type: defaultFiles[filePath].type,
        language: defaultFiles[filePath].language
      }));

      return new Response(JSON.stringify({
        success: true,
        data: { files }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'read') {
      if (!path) throw new Error('Path is required');
      
      const file = defaultFiles[path];
      if (!file) {
        throw new Error('File not found');
      }

      return new Response(JSON.stringify({
        success: true,
        data: { path, content: file.content, language: file.language }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'write') {
      if (!path || content === undefined) throw new Error('Path and content are required');

      // In production, this would write to Cloud Storage
      return new Response(JSON.stringify({
        success: true,
        data: { path, saved: true, timestamp: new Date().toISOString() }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'delete') {
      if (!path) throw new Error('Path is required');

      return new Response(JSON.stringify({
        success: true,
        data: { path, deleted: true }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'tree') {
      const tree = {
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
      };

      return new Response(JSON.stringify({
        success: true,
        data: { tree }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

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

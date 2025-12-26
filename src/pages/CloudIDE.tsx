import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import ClaudeMaxIntegration from '../components/ClaudeMaxIntegration';
import UplinkConnection from '../components/UplinkConnection';
import CloudCodeEditor from '../components/CloudCodeEditor';
import { fileApi, terminalApi, uplink } from '../lib/api';
import {
  ChevronLeft, Play, Square, Terminal as TerminalIcon,
  File, Folder, FolderOpen, Plus, Code, FileCode, X,
  RefreshCw, Sparkles, Server, Cloud,
  Wifi, WifiOff, Upload, Cpu, Globe,
  ChevronRight, MoreVertical, Trash2, Copy, ExternalLink,
  PanelLeftClose, PanelLeft, Settings, GitBranch, Search,
  Menu, Home, LayoutGrid, Layers
} from 'lucide-react';

// Cloud regions
const CLOUD_REGIONS = [
  { id: 'us-central1', name: 'US Central (Iowa)', latency: 45 },
  { id: 'us-east1', name: 'US East (South Carolina)', latency: 38 },
  { id: 'europe-west1', name: 'Europe West (Belgium)', latency: 120 },
  { id: 'asia-east1', name: 'Asia East (Taiwan)', latency: 180 },
];

// Machine types
const MACHINE_TYPES = [
  { id: 'e2-standard-2', name: 'Standard (2 vCPU, 8GB)', cost: 0.067 },
  { id: 'e2-standard-4', name: 'Enhanced (4 vCPU, 16GB)', cost: 0.134 },
  { id: 'n2-standard-4', name: 'Performance (4 vCPU, 16GB)', cost: 0.194 },
  { id: 'n2-standard-8', name: 'Pro (8 vCPU, 32GB)', cost: 0.388 },
];

// File tree structure
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileNode[];
}

const CLOUD_FILES: FileNode[] = [
  { id: 'root', name: 'my-project', type: 'folder', children: [
    { id: 'src', name: 'src', type: 'folder', children: [
      { id: 'main', name: 'main.ts', type: 'file', language: 'typescript' },
      { id: 'app', name: 'App.tsx', type: 'file', language: 'typescript' },
      { id: 'index', name: 'index.css', type: 'file', language: 'css' },
      { id: 'utils', name: 'utils.ts', type: 'file', language: 'typescript' },
    ]},
    { id: 'config', name: 'config', type: 'folder', children: [
      { id: 'env', name: '.env', type: 'file', language: 'env' },
      { id: 'tsconfig', name: 'tsconfig.json', type: 'file', language: 'json' },
    ]},
    { id: 'pkg', name: 'package.json', type: 'file', language: 'json' },
    { id: 'readme', name: 'README.md', type: 'file', language: 'markdown' },
    { id: 'claude', name: 'CLAUDE.md', type: 'file', language: 'markdown' },
  ]},
];

const FILE_CONTENTS: Record<string, string> = {
  'main': `import { createApp } from './App';
import { initializeServices } from './utils';

// Initialize all services
initializeServices();

const app = createApp();

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Cloud IDE Project - Powered by Google Cloud Run');
});`,
  'app': `import React, { useState, useEffect } from 'react';
import { CloudProvider } from './providers/CloudProvider';

export function App() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    // Initialize cloud connection
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('ready');
    };
    init();
  }, []);

  return (
    <CloudProvider>
      <div className="app">
        <header>
          <h1>Cloud IDE Project</h1>
          <span className="status">{status}</span>
        </header>
        <main>
          <p>Powered by Google Cloud Run</p>
        </main>
      </div>
    </CloudProvider>
  );
}

export function createApp() {
  return {
    listen: (port: number, callback: () => void) => {
      callback();
    }
  };
}`,
  'index': `/* Cloud IDE Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: #d97706;
  --background: #0a0a0a;
  --surface: #1a1a1a;
  --text: #fafafa;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--background);
  color: var(--text);
  line-height: 1.5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  padding: 1rem 2rem;
  background: var(--surface);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}`,
  'utils': `// Utility functions for Cloud IDE

export function initializeServices() {
  console.log('Initializing cloud services...');
  
  // Setup WebSocket connection
  setupWebSocket();
  
  // Initialize storage
  initializeStorage();
  
  // Connect to cloud instance
  connectToCloudInstance();
}

function setupWebSocket() {
  // WebSocket setup for real-time sync
  console.log('WebSocket initialized');
}

function initializeStorage() {
  // Cloud storage initialization
  console.log('Cloud storage connected');
}

function connectToCloudInstance() {
  // Connect to Google Cloud Run instance
  console.log('Connected to Cloud Run');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}`,
  'pkg': `{
  "name": "cloud-ide-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "gcloud run deploy"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,
  'claude': `# Cloud IDE Project

## IDENTITY
Cloud-hosted development environment powered by Google Cloud Run.
This project enables seamless browser-to-cloud development workflows.

## WORKFLOW
1. Edit code in the browser using the Cloud IDE interface
2. Changes sync automatically via WebSocket uplink
3. Build and test in the Cloud Run environment
4. Deploy directly to production from the IDE

## ARCHITECTURE
- Frontend: React + TypeScript + Vite
- Backend: Google Cloud Run (code-server)
- Storage: Google Cloud Storage
- Sync: WebSocket-based real-time sync

## COMMANDS
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run deploy\` - Deploy to Cloud Run

## RULES
- Always save before deploying
- Use the terminal for Git operations
- Monitor resource usage in the dashboard`,
  'tsconfig': `{
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
  'env': `# Environment Configuration
VITE_API_URL=https://api.cloud-ide.run.app
VITE_WS_URL=wss://ws.cloud-ide.run.app
VITE_STORAGE_BUCKET=cloud-ide-files
GOOGLE_CLOUD_PROJECT=cloud-ide-project
GOOGLE_CLOUD_REGION=us-central1`,
  'readme': `# Cloud IDE Project

A cloud-hosted development environment built on Google Cloud Run.

## Features

- Browser-based code editing
- Real-time sync via WebSocket
- Integrated terminal
- Git integration
- One-click deployment

## Getting Started

1. Create a cloud instance from the dashboard
2. Select your region and machine type
3. Start coding in the browser

## Technology Stack

- React 18 with TypeScript
- Vite for fast builds
- Google Cloud Run for hosting
- WebSocket for real-time sync

## License

MIT`,
};

export default function CloudIDEPage() {
  const navigate = useNavigate();
  const { cloudIDE, setCloudIDE, addCloudInstance, claudeMaxConnection } = useStore();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'instances' | 'editor' | 'terminal'>('instances');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showUplinkSheet, setShowUplinkSheet] = useState(false);
  const [showMaxIntegration, setShowMaxIntegration] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Instance creation
  const [newInstanceName, setNewInstanceName] = useState('my-workspace');
  const [selectedRegion, setSelectedRegion] = useState('us-central1');
  const [selectedMachine, setSelectedMachine] = useState('e2-standard-2');
  const [isCreating, setIsCreating] = useState(false);
  
  // Editor state
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'src']));
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  
  // Terminal state
  const [terminalOutput, setTerminalOutput] = useState<Array<{ type: string; text: string }>>([
    { type: 'info', text: 'Cloud IDE Terminal v1.0.0' },
    { type: 'info', text: 'Connected to Google Cloud Run instance' },
    { type: 'prompt', text: '' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  
  // Mobile panels
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Auto-connect uplink when Max plan is connected
  const connectUplink = useCallback(async () => {
    setCloudIDE({ uplinkStatus: 'connecting' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCloudIDE({
      uplinkStatus: 'online',
      wsConnection: true,
      connectionStatus: 'connected',
      lastSync: new Date().toISOString(),
    });
  }, [setCloudIDE]);

  useEffect(() => {
    if (claudeMaxConnection.status === 'connected' && cloudIDE.uplinkStatus === 'offline') {
      connectUplink();
    }
  }, [claudeMaxConnection.status, cloudIDE.uplinkStatus, connectUplink]);
  
  // Load file content
  useEffect(() => {
    if (activeFile && FILE_CONTENTS[activeFile]) {
      setEditorContent(FILE_CONTENTS[activeFile]);
      if (!openTabs.includes(activeFile)) {
        setOpenTabs(prev => [...prev, activeFile]);
      }
    }
  }, [activeFile]);
  
  // Scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);
  
  const createInstance = async () => {
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newInstance = {
      id: crypto.randomUUID(),
      name: newInstanceName,
      status: 'running' as const,
      region: selectedRegion,
      machineType: selectedMachine,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      url: `https://${newInstanceName}-${Math.random().toString(36).slice(2, 8)}.run.app`,
    };
    
    addCloudInstance(newInstance);
    setCloudIDE({ activeInstanceId: newInstance.id });
    setIsCreating(false);
    setShowCreateSheet(false);
    setActiveTab('editor');
  };
  
  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    setCloudIDE({ uplinkStatus: 'syncing' });
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setCloudIDE({
      uplinkStatus: 'online',
      lastSync: new Date().toISOString(),
    });
  };
  
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    const cmd = terminalInput.trim();
    const newOutput = [...terminalOutput];
    newOutput[newOutput.length - 1] = { type: 'command', text: `$ ${cmd}` };
    
    // Process commands
    if (cmd === 'help') {
      newOutput.push({ type: 'output', text: 'Available commands:' });
      newOutput.push({ type: 'output', text: '  ls, cd, pwd, cat, echo, clear, git, npm' });
    } else if (cmd === 'clear') {
      setTerminalOutput([{ type: 'prompt', text: '' }]);
      setTerminalInput('');
      return;
    } else if (cmd === 'ls') {
      newOutput.push({ type: 'output', text: 'src/  config/  package.json  README.md  CLAUDE.md' });
    } else if (cmd === 'pwd') {
      newOutput.push({ type: 'output', text: '/workspace/my-project' });
    } else if (cmd.startsWith('npm ')) {
      newOutput.push({ type: 'info', text: `Running: ${cmd}` });
      newOutput.push({ type: 'success', text: 'Done in 1.2s' });
    } else if (cmd.startsWith('git ')) {
      newOutput.push({ type: 'output', text: `git: ${cmd.substring(4)}` });
    } else if (cmd === 'gcloud info') {
      newOutput.push({ type: 'info', text: 'Google Cloud SDK 450.0.0' });
      newOutput.push({ type: 'output', text: 'Project: cloud-ide-project' });
      newOutput.push({ type: 'output', text: 'Region: us-central1' });
    } else {
      newOutput.push({ type: 'output', text: `Executed: ${cmd}` });
    }
    
    newOutput.push({ type: 'prompt', text: '' });
    setTerminalOutput(newOutput);
    setTerminalInput('');
  };
  
  const closeTab = (tabId: string) => {
    setOpenTabs(prev => prev.filter(t => t !== tabId));
    if (activeFile === tabId) {
      const remaining = openTabs.filter(t => t !== tabId);
      setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  const getFileName = (id: string): string => {
    const findFile = (items: FileNode[]): FileNode | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFile(CLOUD_FILES)?.name || 'Unknown';
  };

  const getFileLanguage = (id: string): string => {
    const findFile = (items: FileNode[]): FileNode | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFile(CLOUD_FILES)?.language || 'text';
  };
  
  const renderFileTree = (items: FileNode[], depth = 0) => {
    return items.map(item => {
      const isActive = activeFile === item.id;
      const isExpanded = expandedFolders.has(item.id);
      
      return (
        <div key={item.id}>
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors touch-manipulation
              ${isActive ? 'bg-primary/20 text-primary' : 'text-text-primary hover:bg-surface-elevated active:bg-surface-active'}`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => {
              if (item.type === 'folder') {
                toggleFolder(item.id);
              } else {
                setActiveFile(item.id);
                if (window.innerWidth < 768) {
                  setSidebarVisible(false);
                }
              }
            }}
          >
            {item.type === 'folder' && (
              <ChevronRight className={`w-4 h-4 text-text-tertiary transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            )}
            {item.type === 'folder' ? (
              isExpanded ? <FolderOpen className="w-4 h-4 text-secondary" /> : <Folder className="w-4 h-4 text-secondary" />
            ) : (
              <FileCode className="w-4 h-4 text-text-secondary" />
            )}
            <span className="text-sm truncate">{item.name}</span>
          </button>
          {item.type === 'folder' && isExpanded && item.children && renderFileTree(item.children, depth + 1)}
        </div>
      );
    });
  };
  
  const activeInstance = cloudIDE.instances.find(i => i.id === cloudIDE.activeInstanceId);
  
  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-surface border-b border-border-subtle flex items-center justify-between px-3 flex-shrink-0 safe-area-top">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-primary hover:bg-surface-elevated rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-text-primary text-sm">Cloud IDE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Uplink Status */}
          <button
            onClick={() => setShowUplinkSheet(true)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              cloudIDE.uplinkStatus === 'online' 
                ? 'bg-accent/20 text-accent' 
                : cloudIDE.uplinkStatus === 'syncing'
                ? 'bg-secondary/20 text-secondary'
                : 'bg-surface-elevated text-text-tertiary'
            }`}
          >
            {cloudIDE.uplinkStatus === 'online' ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : cloudIDE.uplinkStatus === 'syncing' || cloudIDE.uplinkStatus === 'connecting' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {cloudIDE.uplinkStatus === 'online' ? 'Uplink' : 
               cloudIDE.uplinkStatus === 'syncing' ? 'Syncing' :
               cloudIDE.uplinkStatus === 'connecting' ? 'Connecting' : 'Offline'}
            </span>
          </button>
          
          {/* Max Plan */}
          <button
            onClick={() => setShowMaxIntegration(true)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              claudeMaxConnection.status === 'connected'
                ? 'bg-primary/20 text-primary'
                : 'bg-surface-elevated text-text-tertiary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {claudeMaxConnection.status === 'connected' ? 'Max' : 'Connect'}
            </span>
          </button>
          
          {/* Mobile Menu */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>
      
      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute right-2 top-14 z-40 bg-surface-elevated rounded-xl shadow-lg border border-border-subtle p-2 min-w-48">
            <button
              onClick={() => { navigate('/'); setShowMobileMenu(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-active rounded-lg"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => { setSidebarVisible(true); setShowMobileMenu(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-active rounded-lg"
            >
              <Folder className="w-4 h-4" />
              Files
            </button>
            <button
              onClick={() => { setShowUplinkSheet(true); setShowMobileMenu(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-active rounded-lg"
            >
              <Wifi className="w-4 h-4" />
              Uplink Status
            </button>
            <button
              onClick={() => { navigate('/settings'); setShowMobileMenu(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-active rounded-lg"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </>
      )}
      
      {/* Tab Navigation */}
      <div className="h-11 bg-surface-elevated border-b border-border-subtle flex items-center px-2 gap-1 flex-shrink-0 overflow-x-auto">
        {[
          { id: 'instances', label: 'Instances', icon: Server },
          { id: 'editor', label: 'Editor', icon: Code },
          { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary'
                : 'text-text-secondary hover:bg-surface-active'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
        
        <div className="flex-1" />
        
        {activeInstance && (
          <div className="flex items-center gap-1.5 px-2 text-xs text-text-tertiary">
            <div className={`w-2 h-2 rounded-full ${
              activeInstance.status === 'running' ? 'bg-accent' : 'bg-text-tertiary'
            }`} />
            <span className="truncate max-w-[100px]">{activeInstance.name}</span>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Instances View */}
        {activeTab === 'instances' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="claude-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-text-secondary">Instances</span>
                </div>
                <p className="text-xl font-semibold text-text-primary">{cloudIDE.instances.length}</p>
              </div>
              <div className="claude-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="text-xs text-text-secondary">Storage</span>
                </div>
                <p className="text-xl font-semibold text-text-primary">
                  {((cloudIDE.storageUsed / cloudIDE.storageLimit) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            
            {/* Create Instance Button */}
            <button
              onClick={() => setShowCreateSheet(true)}
              className="w-full claude-card p-4 flex items-center justify-center gap-2 text-primary hover:bg-surface-elevated transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create Cloud Instance</span>
            </button>
            
            {/* Instance List */}
            {cloudIDE.instances.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-text-secondary">Your Instances</h3>
                {cloudIDE.instances.map(instance => (
                  <div
                    key={instance.id}
                    className={`claude-card p-4 cursor-pointer transition-all ${
                      cloudIDE.activeInstanceId === instance.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setCloudIDE({ activeInstanceId: instance.id });
                      setActiveTab('editor');
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          instance.status === 'running' ? 'bg-accent' :
                          instance.status === 'starting' ? 'bg-warning animate-pulse' : 'bg-text-tertiary'
                        }`} />
                        <span className="font-medium text-text-primary">{instance.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        instance.status === 'running' ? 'bg-accent/20 text-accent' : 'bg-muted text-text-tertiary'
                      }`}>
                        {instance.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {CLOUD_REGIONS.find(r => r.id === instance.region)?.name.split(' ')[0]}
                      </div>
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {MACHINE_TYPES.find(m => m.id === instance.machineType)?.name.split(' ')[0]}
                      </div>
                    </div>
                    
                    {instance.status === 'running' && (
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium">
                          Open IDE
                        </button>
                        <button className="px-3 py-1.5 bg-surface-elevated text-text-secondary rounded-lg">
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="claude-card p-8 text-center">
                <Cloud className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                <p className="text-text-secondary mb-1">No cloud instances</p>
                <p className="text-xs text-text-tertiary">Create a new instance to start coding</p>
              </div>
            )}
          </div>
        )}
        
        {/* Editor View */}
        {activeTab === 'editor' && (
          <>
            {/* Mobile Sidebar Overlay */}
            {sidebarVisible && (
              <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarVisible(false)} />
            )}
            
            {/* Sidebar */}
            <div className={`
              fixed md:relative inset-y-0 left-0 w-64 bg-surface border-r border-border-subtle flex flex-col z-40
              transform transition-transform duration-200 md:transform-none
              ${sidebarVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `} style={{ top: 'var(--header-height, 0)' }}>
              <div className="p-3 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-text-primary">Explorer</span>
                </div>
                <button className="p-1 hover:bg-surface-elevated rounded md:hidden" onClick={() => setSidebarVisible(false)}>
                  <X className="w-4 h-4 text-text-tertiary" />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="p-2 border-b border-border-subtle flex items-center gap-1">
                <button className="p-1.5 hover:bg-surface-elevated rounded-lg text-text-tertiary" title="New File">
                  <File className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-surface-elevated rounded-lg text-text-tertiary" title="New Folder">
                  <Folder className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-surface-elevated rounded-lg text-text-tertiary" title="Search">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-surface-elevated rounded-lg text-text-tertiary" title="Git">
                  <GitBranch className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-2">
                {renderFileTree(CLOUD_FILES)}
              </div>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Open Tabs */}
              {openTabs.length > 0 && (
                <div className="h-9 bg-surface border-b border-border-subtle flex items-center overflow-x-auto">
                  {openTabs.map(tabId => (
                    <div
                      key={tabId}
                      className={`flex items-center gap-2 px-3 h-full border-r border-border-subtle cursor-pointer min-w-fit ${
                        activeFile === tabId ? 'bg-canvas text-text-primary' : 'text-text-secondary hover:bg-surface-elevated'
                      }`}
                      onClick={() => setActiveFile(tabId)}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span className="text-xs">{getFileName(tabId)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                        className="p-0.5 hover:bg-surface-active rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {activeFile ? (
                <CloudCodeEditor
                  content={editorContent}
                  onChange={setEditorContent}
                  onSave={handleSave}
                  language={getFileLanguage(activeFile)}
                  fileName={getFileName(activeFile)}
                  isSaving={isSaving}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Code className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                    <p className="text-lg text-text-secondary mb-2">No file selected</p>
                    <p className="text-sm text-text-tertiary mb-4">
                      Select a file from the explorer to start editing
                    </p>
                    <button
                      onClick={() => setSidebarVisible(true)}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium md:hidden"
                    >
                      Open File Explorer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Terminal View */}
        {activeTab === 'terminal' && (
          <div className="flex-1 flex flex-col bg-canvas">
            <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {terminalOutput.map((line, i) => (
                <div key={i} className={
                  line.type === 'error' ? 'text-destructive' :
                  line.type === 'success' ? 'text-accent' :
                  line.type === 'info' ? 'text-secondary' :
                  line.type === 'command' ? 'text-primary' : 'text-text-primary'
                }>
                  {line.type === 'prompt' ? (
                    <span className="text-accent">$</span>
                  ) : (
                    line.text
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleTerminalSubmit} className="p-3 border-t border-border-subtle bg-surface">
              <div className="flex items-center gap-2">
                <span className="text-accent font-mono">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="flex-1 bg-surface-elevated px-3 py-2 rounded-lg text-text-primary placeholder-text-tertiary outline-none font-mono text-sm"
                  placeholder="Enter command..."
                />
                <button type="submit" className="p-2 bg-primary text-white rounded-lg">
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Bottom Action Bar (Mobile) */}
      <div className="h-14 bg-surface border-t border-border-subtle flex items-center justify-around px-4 md:hidden safe-area-bottom">
        <button
          onClick={() => setSidebarVisible(true)}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg text-text-tertiary active:bg-surface-elevated"
        >
          <Folder className="w-5 h-5" />
          <span className="text-[10px]">Files</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg ${activeTab === 'editor' ? 'text-primary' : 'text-text-tertiary'}`}
        >
          <Code className="w-5 h-5" />
          <span className="text-[10px]">Editor</span>
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg ${activeTab === 'terminal' ? 'text-primary' : 'text-text-tertiary'}`}
        >
          <TerminalIcon className="w-5 h-5" />
          <span className="text-[10px]">Terminal</span>
        </button>
        <button
          onClick={() => setShowUplinkSheet(true)}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg ${cloudIDE.uplinkStatus === 'online' ? 'text-accent' : 'text-text-tertiary'}`}
        >
          <Wifi className="w-5 h-5" />
          <span className="text-[10px]">Uplink</span>
        </button>
      </div>
      
      {/* Create Instance Sheet */}
      {showCreateSheet && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowCreateSheet(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-text-tertiary/40 rounded-full" />
            </div>
            <div className="px-4 pb-3 border-b border-border-subtle">
              <h2 className="text-lg font-semibold text-text-primary text-center">Create Cloud Instance</h2>
            </div>
            <div className="overflow-y-auto max-h-[65vh] p-4 space-y-4">
              {/* Instance Name */}
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Instance Name</label>
                <input
                  type="text"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-elevated rounded-xl text-text-primary placeholder-text-tertiary border border-border-subtle focus:border-primary outline-none"
                  placeholder="my-workspace"
                />
              </div>
              
              {/* Region */}
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Region</label>
                <div className="space-y-2">
                  {CLOUD_REGIONS.map(region => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={`w-full p-3 rounded-xl border transition-colors flex items-center justify-between ${
                        selectedRegion === region.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-surface-elevated border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm text-text-primary">{region.name}</span>
                      </div>
                      <span className="text-xs text-text-tertiary">{region.latency}ms</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Machine Type */}
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Machine Type</label>
                <div className="space-y-2">
                  {MACHINE_TYPES.map(machine => (
                    <button
                      key={machine.id}
                      onClick={() => setSelectedMachine(machine.id)}
                      className={`w-full p-3 rounded-xl border transition-colors flex items-center justify-between ${
                        selectedMachine === machine.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-surface-elevated border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm text-text-primary">{machine.name}</span>
                      </div>
                      <span className="text-xs text-accent">${machine.cost}/hr</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={createInstance}
                disabled={isCreating || !newInstanceName.trim()}
                className="w-full p-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Instance
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Uplink Connection Sheet */}
      <UplinkConnection isOpen={showUplinkSheet} onClose={() => setShowUplinkSheet(false)} />
      
      {/* Claude Max Integration */}
      <ClaudeMaxIntegration isOpen={showMaxIntegration} onClose={() => setShowMaxIntegration(false)} />
    </div>
  );
}

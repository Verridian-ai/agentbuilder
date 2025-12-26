import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { BottomSheet } from '../components/MobileNavigation';
import ClaudeMaxIntegration from '../components/ClaudeMaxIntegration';
import ClaudeCodeCLIInstaller from '../components/ClaudeCodeCLIInstaller';
import {
  ChevronLeft, ChevronRight, Play, Terminal as TerminalIcon,
  File, Folder, FolderOpen, Settings, Search, GitBranch,
  Code, FileCode, FileJson, FileText, Cpu, Check, X, AlertCircle,
  RefreshCw, Minus, Sparkles, Server, Key, Activity, Box, Puzzle, Shield,
  Crown, Download, Wifi, WifiOff, Link2
} from 'lucide-react';

// Anthropic Plugins Configuration
const ANTHROPIC_PLUGINS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Terminal-native agentic coding assistant',
    category: 'Core',
    icon: Code,
    enabled: true,
    features: ['File editing', 'Command execution', 'Git integration', 'Code review'],
  },
  {
    id: 'mcp-filesystem',
    name: 'MCP Filesystem',
    description: 'Secure file system access via MCP',
    category: 'MCP',
    icon: Folder,
    enabled: true,
    features: ['Read files', 'Write files', 'Directory listing', 'File search'],
  },
  {
    id: 'mcp-github',
    name: 'MCP GitHub',
    description: 'GitHub integration for repos and issues',
    category: 'MCP',
    icon: GitBranch,
    enabled: false,
    features: ['Clone repos', 'Create PRs', 'Manage issues', 'Code search'],
  },
  {
    id: 'mcp-puppeteer',
    name: 'MCP Puppeteer',
    description: 'Browser automation and web scraping',
    category: 'MCP',
    icon: Box,
    enabled: false,
    features: ['Navigate pages', 'Take screenshots', 'Fill forms', 'Extract data'],
  },
  {
    id: 'anthropic-tools',
    name: 'Anthropic Tools',
    description: 'Official Anthropic development tools',
    category: 'Core',
    icon: Puzzle,
    enabled: true,
    features: ['Prompt caching', 'Batch processing', 'Streaming', 'Tool use'],
  },
  {
    id: 'enterprise-audit',
    name: 'Enterprise Audit',
    description: 'Compliance and audit logging',
    category: 'Enterprise',
    icon: Shield,
    enabled: false,
    features: ['Usage logs', 'Access control', 'Data retention', 'Compliance API'],
  },
];

// File tree with all files
const FILE_TREE = [
  { id: '1', name: 'src', type: 'folder', children: [
    { id: '2', name: 'components', type: 'folder', children: [
      { id: '3', name: 'Button.tsx', type: 'file', language: 'typescript' },
      { id: '4', name: 'Card.tsx', type: 'file', language: 'typescript' },
      { id: '13', name: 'Modal.tsx', type: 'file', language: 'typescript' },
      { id: '14', name: 'Input.tsx', type: 'file', language: 'typescript' },
    ]},
    { id: '5', name: 'pages', type: 'folder', children: [
      { id: '6', name: 'Home.tsx', type: 'file', language: 'typescript' },
      { id: '7', name: 'Settings.tsx', type: 'file', language: 'typescript' },
      { id: '15', name: 'Dashboard.tsx', type: 'file', language: 'typescript' },
    ]},
    { id: '8', name: 'App.tsx', type: 'file', language: 'typescript' },
    { id: '9', name: 'index.css', type: 'file', language: 'css' },
    { id: '16', name: 'store.ts', type: 'file', language: 'typescript' },
  ]},
  { id: '10', name: 'package.json', type: 'file', language: 'json' },
  { id: '11', name: 'CLAUDE.md', type: 'file', language: 'markdown' },
  { id: '12', name: 'tsconfig.json', type: 'file', language: 'json' },
];

// Complete mock file contents for all files
const FILE_CONTENTS: Record<string, string> = {
  '3': `import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ 
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false
}: ButtonProps) {
  const baseStyles = 'rounded-claude font-medium transition-all inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:scale-95',
    secondary: 'bg-surface-elevated text-primary border border-border hover:bg-surface-active',
    ghost: 'bg-transparent text-text-primary hover:bg-surface-elevated',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };
  
  return (
    <button
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Spinner className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}`,
  '4': `import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  title,
  description,
  children,
  className = '',
  onClick,
  hoverable = false
}: CardProps) {
  return (
    <div 
      className={\`
        bg-surface rounded-claude border border-border-subtle p-4
        \${hoverable ? 'hover:border-primary/50 cursor-pointer transition-colors' : ''}
        \${className}
      \`}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-text-secondary mb-3">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-border-subtle pb-3 mb-3">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-border-subtle pt-3 mt-3 flex gap-2">{children}</div>;
}`,
  '13': `import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div 
        ref={modalRef}
        className={\`relative bg-surface rounded-claude border border-border-subtle w-full \${sizes[size]} max-h-[90vh] overflow-auto\`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}`,
  '14': `import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={\`
            w-full px-4 py-2.5 bg-surface-elevated rounded-claude
            text-text-primary placeholder-text-tertiary
            border border-border-subtle
            focus:border-primary focus:ring-2 focus:ring-primary/20
            transition-colors
            \${leftIcon ? 'pl-10' : ''}
            \${rightIcon ? 'pr-10' : ''}
            \${error ? 'border-destructive' : ''}
            \${className}
          \`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helperText && !error && <p className="text-sm text-text-tertiary">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';`,
  '6': `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Sparkles, Code, Server, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Agents',
      description: 'Build intelligent agents with Claude AI integration',
    },
    {
      icon: Code,
      title: 'Visual Builder',
      description: 'Drag and drop workflow editor for agent design',
    },
    {
      icon: Server,
      title: 'MCP Integration',
      description: 'Connect to external tools via Model Context Protocol',
    },
  ];
  
  return (
    <div className="min-h-screen bg-canvas p-4 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Welcome to Claude Agent Builder
        </h1>
        <p className="text-text-secondary">
          Create powerful AI agents with ease
        </p>
      </header>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {features.map((feature, i) => (
          <Card key={i} hoverable>
            <feature.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-text-primary mb-1">{feature.title}</h3>
            <p className="text-sm text-text-secondary">{feature.description}</p>
          </Card>
        ))}
      </div>
      
      <Button onClick={() => navigate('/builder')} size="lg">
        Get Started <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}`,
  '7': `import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useStore } from '../store';
import { User, Key, Bell, Moon, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser, openRouterApiKey, setOpenRouterApiKey } = useStore();
  const [apiKey, setApiKey] = useState(openRouterApiKey || '');
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    setOpenRouterApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  return (
    <div className="min-h-screen bg-canvas p-4 pb-24">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>
      
      <div className="space-y-4">
        <Card title="Profile">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">{user?.email || 'Guest'}</p>
              <p className="text-sm text-text-secondary">Free Plan</p>
            </div>
          </div>
        </Card>
        
        <Card title="API Configuration">
          <Input
            label="OpenRouter API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            leftIcon={<Key className="w-4 h-4" />}
          />
          <Button onClick={handleSave} className="mt-4">
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </Card>
      </div>
    </div>
  );
}`,
  '15': `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useStore } from '../store';
import { Plus, Folder, Clock, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, createProject } = useStore();
  
  const recentProjects = projects.slice(0, 5);
  
  const handleCreateNew = () => {
    const id = createProject('New Agent');
    navigate(\`/builder/\${id}\`);
  };
  
  return (
    <div className="min-h-screen bg-canvas p-4 pb-24">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="w-5 h-5" /> New Agent
        </Button>
      </header>
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Recent Projects
        </h2>
        
        {recentProjects.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary">No projects yet</p>
              <Button variant="secondary" onClick={handleCreateNew} className="mt-4">
                Create your first agent
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentProjects.map(project => (
              <Card
                key={project.id}
                hoverable
                onClick={() => navigate(\`/builder/\${project.id}\`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">{project.name}</h3>
                    <p className="text-sm text-text-tertiary">
                      Updated {project.updatedAt}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-tertiary" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}`,
  '8': `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MobileNavProvider, TabBar } from './components/MobileNavigation';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Settings from './pages/Settings';
import IDE from './pages/IDE';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <MobileNavProvider>
        <div className="min-h-screen bg-canvas">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/builder/:id" element={<Builder />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ide" element={<IDE />} />
          </Routes>
          <TabBar />
        </div>
      </MobileNavProvider>
    </BrowserRouter>
  );
}

export default App;`,
  '9': `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Claude Design System */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --background: #141413;
  --foreground: #faf9f5;
  --primary: #d97757;
  --secondary: #6a9bcc;
  --accent: #788c5d;
  --surface: #1a1918;
  --surface-elevated: #242320;
  --border-subtle: rgba(176, 174, 165, 0.15);
  --text-primary: #faf9f5;
  --text-secondary: #b0aea5;
  --text-tertiary: rgba(176, 174, 165, 0.6);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
}

code, pre {
  font-family: 'JetBrains Mono', monospace;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--surface);
}

::-webkit-scrollbar-thumb {
  background: var(--surface-elevated);
  border-radius: 4px;
}

/* Custom Components */
.claude-card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}

.claude-button-primary {
  background: var(--primary);
  color: white;
  border-radius: 10px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.2s;
}

.claude-button-primary:hover {
  filter: brightness(0.9);
}`,
  '16': `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // API Keys
  openRouterApiKey: string | null;
  setOpenRouterApiKey: (key: string | null) => void;
  claudeCodeApiKey: string | null;
  setClaudeCodeApiKey: (key: string | null) => void;
  
  // Projects
  projects: Project[];
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      
      openRouterApiKey: null,
      setOpenRouterApiKey: (openRouterApiKey) => set({ openRouterApiKey }),
      claudeCodeApiKey: null,
      setClaudeCodeApiKey: (claudeCodeApiKey) => set({ claudeCodeApiKey }),
      
      projects: [],
      createProject: (name) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set(state => ({
          projects: [...state.projects, { id, name, createdAt: now, updatedAt: now }]
        }));
        return id;
      },
      deleteProject: (id) => set(state => ({
        projects: state.projects.filter(p => p.id !== id)
      })),
      
      sidebarOpen: true,
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'claude-agent-builder' }
  )
);`,
  '10': `{
  "name": "claude-agent-builder",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "zustand": "^5.0.0",
    "lucide-react": "^0.460.0",
    "@anthropic-ai/sdk": "^0.32.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "~5.6.2",
    "vite": "^5.4.10",
    "vitest": "^2.1.0"
  }
}`,
  '11': `# Project: Claude Agent Builder Platform

## IDENTITY
You are Claude, an AI assistant created by Anthropic. Your role is to help developers 
build intelligent agent workflows using the Claude Agent Builder platform.

## CAPABILITIES
- Understand project requirements and architecture
- Write clean, maintainable TypeScript/React code
- Debug issues systematically with root cause analysis
- Integrate with external APIs and services via MCP
- Provide code reviews with actionable feedback

## WORKFLOW
1. **Understand** - Gather context and clarify requirements
2. **Plan** - Create a structured approach before coding
3. **Execute** - Implement step by step with verification
4. **Verify** - Test changes and validate behavior
5. **Document** - Update relevant documentation

## TOOLS
- **Read**: Access file contents from the project
- **Write**: Create or update files
- **Edit**: Make precise edits to existing files
- **Bash**: Execute terminal commands
- **Glob**: Find files matching patterns
- **Grep**: Search file contents

## MCP INTEGRATIONS
- **filesystem**: Secure file system operations
- **github**: Repository and issue management
- **puppeteer**: Browser automation
- **postgres**: Database queries

## RULES
- Always follow TypeScript best practices
- Use the Claude design system tokens
- Write unit tests for critical functions
- Keep components small and focused
- Document public APIs and complex logic
- Never commit sensitive data or API keys
- Ask for clarification rather than assume

## STYLE GUIDE
- Use functional components with hooks
- Prefer composition over inheritance
- Use Tailwind CSS for styling
- Follow the DRY principle
- Handle errors gracefully with user feedback`,
  '12': `{
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
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@pages/*": ["./src/pages/*"],
      "@lib/*": ["./src/lib/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
};

// Code completion suggestions
const CODE_COMPLETIONS: Record<string, string[]> = {
  'const': ['const name = ', 'const [state, setState] = useState()', 'const handleClick = () => {}'],
  'function': ['function name() {}', 'function Component() { return <div></div> }'],
  'import': ['import React from "react"', 'import { useState } from "react"', 'import { useNavigate } from "react-router-dom"'],
  'use': ['useState()', 'useEffect(() => {}, [])', 'useRef(null)', 'useCallback(() => {}, [])'],
  'return': ['return <div></div>', 'return null', 'return ()', 'return { ...state }'],
  'interface': ['interface Props {}', 'interface State {}'],
  'export': ['export default', 'export function', 'export const', 'export interface'],
};

// Syntax highlighting
function highlightCode(code: string, language: string): JSX.Element[] {
  const lines = code.split('\n');
  
  return lines.map((line, i) => {
    let highlighted = line;
    
    if (language === 'typescript' || language === 'javascript') {
      highlighted = highlighted.replace(
        /\b(import|export|from|const|let|var|function|return|if|else|interface|type|class|extends|implements|new|this|async|await|default|true|false|null|undefined)\b/g,
        '<span class="syntax-keyword">$1</span>'
      );
      highlighted = highlighted.replace(
        /(['"`])(.*?)\1/g,
        '<span class="syntax-string">$1$2$1</span>'
      );
      highlighted = highlighted.replace(
        /(\/\/.*$)/g,
        '<span class="syntax-comment">$1</span>'
      );
      highlighted = highlighted.replace(
        /:\s*([A-Z][a-zA-Z]*)/g,
        ': <span class="syntax-type">$1</span>'
      );
      highlighted = highlighted.replace(
        /\b(\d+)\b/g,
        '<span class="syntax-number">$1</span>'
      );
    } else if (language === 'json') {
      highlighted = highlighted.replace(
        /"([^"]+)":/g,
        '<span class="syntax-keyword">"$1"</span>:'
      );
      highlighted = highlighted.replace(
        /: "([^"]+)"/g,
        ': <span class="syntax-string">"$1"</span>'
      );
      highlighted = highlighted.replace(
        /\b(\d+)\b/g,
        '<span class="syntax-number">$1</span>'
      );
    } else if (language === 'css') {
      highlighted = highlighted.replace(
        /([a-z-]+):/g,
        '<span class="syntax-keyword">$1</span>:'
      );
      highlighted = highlighted.replace(
        /#[a-fA-F0-9]+/g,
        '<span class="syntax-string">$&</span>'
      );
    } else if (language === 'markdown') {
      highlighted = highlighted.replace(
        /^(#+)\s+(.*)$/g,
        '<span class="syntax-keyword">$1</span> <span class="syntax-type">$2</span>'
      );
      highlighted = highlighted.replace(
        /\*\*([^*]+)\*\*/g,
        '<span class="syntax-keyword">**$1**</span>'
      );
      highlighted = highlighted.replace(
        /^- (.*)$/g,
        '<span class="syntax-string">- $1</span>'
      );
    }
    
    return (
      <div key={i} className="code-line flex">
        <span className="code-line-number">{i + 1}</span>
        <span dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
      </div>
    );
  });
}

function getFileIcon(name: string, type: string) {
  if (type === 'folder') return Folder;
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return FileCode;
  if (name.endsWith('.json')) return FileJson;
  if (name.endsWith('.md')) return FileText;
  if (name.endsWith('.css')) return File;
  return File;
}

function getLanguage(id: string): string {
  const file = findFileById(FILE_TREE, id);
  if (file?.language) return file.language;
  if (file?.name.endsWith('.json')) return 'json';
  if (file?.name.endsWith('.css')) return 'css';
  if (file?.name.endsWith('.md')) return 'markdown';
  return 'typescript';
}

function findFileById(items: any[], id: string): any {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findFileById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function IDEPage() {
  const navigate = useNavigate();
  const { openRouterApiKey, claudeCodeApiKey, claudeMaxConnection, claudeCodeCLI } = useStore();
  
  const [activeFile, setActiveFile] = useState<string | null>('8');
  const [openFiles, setOpenFiles] = useState<string[]>(['8', '11', '3']);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '2', '5']));
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [terminalOutput, setTerminalOutput] = useState<Array<{ type: string; text: string }>>([
    { type: 'info', text: 'Claude IDE v1.0.0 - Powered by Anthropic' },
    { type: 'info', text: 'Type "help" for available commands' },
    { type: 'prompt', text: '$ ' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'files' | 'search' | 'git' | 'plugins'>('files');
  const [showPluginsSheet, setShowPluginsSheet] = useState(false);
  const [showMaxIntegration, setShowMaxIntegration] = useState(false);
  const [showCLIInstaller, setShowCLIInstaller] = useState(false);
  const [enabledPlugins, setEnabledPlugins] = useState<Set<string>>(
    new Set(ANTHROPIC_PLUGINS.filter(p => p.enabled).map(p => p.id))
  );
  
  // Code completion state
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionItems, setCompletionItems] = useState<string[]>([]);
  const [selectedCompletion, setSelectedCompletion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, col: 0 });
  const [editorContent, setEditorContent] = useState('');
  
  const [apiStatus, setApiStatus] = useState<'checking' | 'valid' | 'invalid' | 'none'>('none');
  const [apiUsage, setApiUsage] = useState({ requests: 147, tokens: 52840, cost: 0.42 });
  
  const terminalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (openRouterApiKey || claudeCodeApiKey) {
      setApiStatus('checking');
      const timer = setTimeout(() => {
        const isValid = (openRouterApiKey?.startsWith('sk-or-') || claudeCodeApiKey?.startsWith('sk-ant-'));
        setApiStatus(isValid ? 'valid' : 'invalid');
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setApiStatus('none');
    }
  }, [openRouterApiKey, claudeCodeApiKey]);
  
  useEffect(() => {
    if (activeFile && FILE_CONTENTS[activeFile]) {
      setEditorContent(FILE_CONTENTS[activeFile]);
    }
  }, [activeFile]);
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);
  
  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const openFile = (id: string) => {
    if (!openFiles.includes(id)) {
      setOpenFiles([...openFiles, id]);
    }
    setActiveFile(id);
  };
  
  const closeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f !== id);
    setOpenFiles(newOpenFiles);
    if (activeFile === id) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1] || null);
    }
  };
  
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const value = target.value;
    const pos = target.selectionStart;
    
    // Get current word
    const beforeCursor = value.substring(0, pos);
    const words = beforeCursor.split(/[\s\n]/);
    const currentWord = words[words.length - 1];
    
    // Trigger completion on specific keys
    if (currentWord.length >= 2) {
      const matches = Object.entries(CODE_COMPLETIONS)
        .filter(([key]) => key.startsWith(currentWord.toLowerCase()))
        .flatMap(([_, suggestions]) => suggestions);
      
      if (matches.length > 0) {
        setCompletionItems(matches);
        setShowCompletion(true);
        setSelectedCompletion(0);
        
        // Calculate position
        const lines = beforeCursor.split('\n');
        setCursorPosition({ line: lines.length, col: lines[lines.length - 1].length });
      } else {
        setShowCompletion(false);
      }
    } else {
      setShowCompletion(false);
    }
    
    // Handle completion navigation
    if (showCompletion) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCompletion(prev => Math.min(prev + 1, completionItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCompletion(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        // Insert completion
        const completion = completionItems[selectedCompletion];
        const newValue = value.substring(0, pos - currentWord.length) + completion + value.substring(pos);
        setEditorContent(newValue);
        setShowCompletion(false);
      } else if (e.key === 'Escape') {
        setShowCompletion(false);
      }
    }
  };
  
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    const cmd = terminalInput.trim();
    const newOutput = [...terminalOutput];
    newOutput[newOutput.length - 1] = { type: 'prompt', text: `$ ${cmd}` };
    
    if (cmd === 'help') {
      newOutput.push({ type: 'output', text: 'Available commands:' });
      newOutput.push({ type: 'output', text: '  claude - Start Claude Code session' });
      newOutput.push({ type: 'output', text: '  claude doctor - Check installation' });
      newOutput.push({ type: 'output', text: '  clear - Clear terminal' });
      newOutput.push({ type: 'output', text: '  ls - List files' });
      newOutput.push({ type: 'output', text: '  api-status - Check API key status' });
    } else if (cmd === 'clear') {
      setTerminalOutput([{ type: 'prompt', text: '$ ' }]);
      setTerminalInput('');
      return;
    } else if (cmd === 'claude doctor') {
      newOutput.push({ type: 'success', text: 'Claude Code v1.0.0' });
      newOutput.push({ type: 'output', text: 'Checking installation...' });
      newOutput.push({ type: 'success', text: '[OK] Node.js 20.10.0' });
      newOutput.push({ type: 'success', text: '[OK] API Key configured' });
      newOutput.push({ type: 'success', text: '[OK] MCP servers available' });
      newOutput.push({ type: 'success', text: 'All checks passed!' });
    } else if (cmd === 'api-status') {
      if (apiStatus === 'valid') {
        newOutput.push({ type: 'success', text: 'API Status: Connected' });
        newOutput.push({ type: 'output', text: `Requests: ${apiUsage.requests}` });
        newOutput.push({ type: 'output', text: `Tokens: ${apiUsage.tokens.toLocaleString()}` });
        newOutput.push({ type: 'output', text: `Cost: $${apiUsage.cost.toFixed(2)}` });
      } else {
        newOutput.push({ type: 'error', text: 'API Status: Not configured' });
        newOutput.push({ type: 'output', text: 'Set your API key in Settings' });
      }
    } else if (cmd === 'ls') {
      newOutput.push({ type: 'output', text: 'src/  package.json  CLAUDE.md  tsconfig.json' });
    } else if (cmd.startsWith('claude')) {
      newOutput.push({ type: 'info', text: 'Starting Claude Code session...' });
      newOutput.push({ type: 'success', text: 'Connected to claude-3-5-sonnet-20241022' });
      newOutput.push({ type: 'output', text: 'How can I help you today?' });
    } else {
      newOutput.push({ type: 'error', text: `Command not found: ${cmd}` });
    }
    
    newOutput.push({ type: 'prompt', text: '$ ' });
    setTerminalOutput(newOutput);
    setTerminalInput('');
  };
  
  const togglePlugin = (id: string) => {
    setEnabledPlugins(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const getFileName = (id: string): string => {
    const file = findFileById(FILE_TREE, id);
    return file?.name || 'Unknown';
  };
  
  const renderFileTree = (items: any[], depth = 0) => {
    return items.map(item => {
      const Icon = item.type === 'folder' 
        ? (expandedFolders.has(item.id) ? FolderOpen : Folder)
        : getFileIcon(item.name, item.type);
      const isActive = activeFile === item.id;
      
      return (
        <div key={item.id}>
          <div
            className={`file-tree-item ${isActive ? 'file-tree-item-active' : ''}`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => item.type === 'folder' ? toggleFolder(item.id) : openFile(item.id)}
          >
            {item.type === 'folder' && (
              <ChevronRight className={`w-3 h-3 text-text-tertiary transition-transform ${expandedFolders.has(item.id) ? 'rotate-90' : ''}`} />
            )}
            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
            <span className={`text-sm truncate ${isActive ? 'text-primary font-medium' : 'text-text-primary'}`}>
              {item.name}
            </span>
          </div>
          {item.type === 'folder' && expandedFolders.has(item.id) && item.children && renderFileTree(item.children, depth + 1)}
        </div>
      );
    });
  };
  
  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 bg-surface border-b border-border-subtle flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-border-default hidden sm:block" />
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="font-semibold text-text-primary">Claude IDE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Claude Max Connection Status */}
          <button 
            onClick={() => setShowMaxIntegration(true)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              claudeMaxConnection.status === 'connected' 
                ? 'bg-accent/20 text-accent hover:bg-accent/30' 
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-active'
            }`}
          >
            {claudeMaxConnection.status === 'connected' ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">
              {claudeMaxConnection.status === 'connected' 
                ? claudeMaxConnection.planType === 'max20x' ? 'Max 20x' : 'Max 5x'
                : 'Connect Max'}
            </span>
          </button>
          
          {/* Claude Code CLI Status */}
          <button 
            onClick={() => setShowCLIInstaller(true)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              claudeCodeCLI.installed 
                ? 'bg-secondary/20 text-secondary hover:bg-secondary/30' 
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-active'
            }`}
          >
            {claudeCodeCLI.installed ? (
              <Check className="w-3 h-3" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">
              {claudeCodeCLI.installed ? `CLI v${claudeCodeCLI.version}` : 'Install CLI'}
            </span>
          </button>
          
          <div className={`api-status-badge ${apiStatus === 'valid' ? 'api-status-valid' : apiStatus === 'invalid' ? 'api-status-invalid' : apiStatus === 'checking' ? 'api-status-checking' : 'bg-muted text-text-tertiary'}`}>
            {apiStatus === 'checking' && <RefreshCw className="w-3 h-3 animate-spin" />}
            {apiStatus === 'valid' && <Check className="w-3 h-3" />}
            {apiStatus === 'invalid' && <AlertCircle className="w-3 h-3" />}
            {apiStatus === 'none' && <Key className="w-3 h-3" />}
            <span className="hidden sm:inline">
              {apiStatus === 'valid' ? 'API Connected' : apiStatus === 'invalid' ? 'Invalid Key' : apiStatus === 'checking' ? 'Checking...' : 'No API Key'}
            </span>
          </div>
          <button onClick={() => setShowPluginsSheet(true)} className="p-2 hover:bg-surface-elevated rounded-claude transition-colors">
            <Puzzle className="w-5 h-5 text-text-secondary" />
          </button>
          <button onClick={() => navigate('/settings')} className="p-2 hover:bg-surface-elevated rounded-claude transition-colors">
            <Settings className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="w-64 bg-surface border-r border-border-subtle flex flex-col flex-shrink-0">
            <div className="flex border-b border-border-subtle">
              {[
                { id: 'files', icon: File },
                { id: 'search', icon: Search },
                { id: 'git', icon: GitBranch },
                { id: 'plugins', icon: Puzzle },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 p-3 flex items-center justify-center transition-colors ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  <tab.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {activeTab === 'files' && <div className="space-y-1">{renderFileTree(FILE_TREE)}</div>}
              {activeTab === 'search' && (
                <div className="space-y-3">
                  <input type="text" placeholder="Search files..." className="w-full px-3 py-2 bg-surface-elevated rounded-claude text-sm text-text-primary placeholder-text-tertiary border border-border-subtle focus:border-primary" />
                  <p className="text-xs text-text-tertiary text-center py-4">Enter a search term</p>
                </div>
              )}
              {activeTab === 'git' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2"><div className="status-dot status-online" /><span className="text-sm text-text-primary">main</span></div>
                  <div className="text-xs text-text-secondary p-2"><p>No changes to commit</p><p className="mt-1 text-text-tertiary">Working tree clean</p></div>
                </div>
              )}
              {activeTab === 'plugins' && (
                <div className="space-y-2">
                  <p className="text-xs text-text-tertiary px-2 py-1">Anthropic Plugins</p>
                  {ANTHROPIC_PLUGINS.map(plugin => (
                    <button key={plugin.id} onClick={() => togglePlugin(plugin.id)} className={`w-full p-2 rounded-claude text-left flex items-center gap-2 transition-colors ${enabledPlugins.has(plugin.id) ? 'bg-primary/10 border border-primary/30' : 'hover:bg-surface-elevated'}`}>
                      <plugin.icon className={`w-4 h-4 ${enabledPlugins.has(plugin.id) ? 'text-primary' : 'text-text-secondary'}`} />
                      <span className={`text-sm truncate ${enabledPlugins.has(plugin.id) ? 'text-primary' : 'text-text-primary'}`}>{plugin.name}</span>
                      {enabledPlugins.has(plugin.id) && <Check className="w-3 h-3 text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="h-10 bg-surface-elevated border-b border-border-subtle flex items-center overflow-x-auto flex-shrink-0">
            <button onClick={() => setSidebarVisible(!sidebarVisible)} className="p-2 hover:bg-surface-active transition-colors">
              {sidebarVisible ? <ChevronLeft className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
            </button>
            
            {openFiles.map(fileId => {
              const fileName = getFileName(fileId);
              const isActive = activeFile === fileId;
              return (
                <button key={fileId} onClick={() => setActiveFile(fileId)} className={`h-full px-3 flex items-center gap-2 border-r border-border-subtle transition-colors ${isActive ? 'bg-surface text-text-primary' : 'text-text-secondary hover:bg-surface'}`}>
                  <FileCode className="w-4 h-4" />
                  <span className="text-sm whitespace-nowrap">{fileName}</span>
                  <button onClick={(e) => closeFile(fileId, e)} className="p-0.5 hover:bg-surface-active rounded transition-colors"><X className="w-3 h-3" /></button>
                </button>
              );
            })}
          </div>
          
          {/* Editor with Code Completion */}
          <div className="flex-1 overflow-auto bg-canvas relative">
            {activeFile && FILE_CONTENTS[activeFile] ? (
              <div className="relative">
                {/* Syntax Highlighted Display */}
                <div className="code-editor min-h-full">
                  <div className="py-2">{highlightCode(FILE_CONTENTS[activeFile], getLanguage(activeFile))}</div>
                </div>
                
                {/* Code Completion Popup */}
                {showCompletion && completionItems.length > 0 && (
                  <div 
                    className="absolute z-50 bg-surface-elevated border border-border-subtle rounded-claude shadow-claude-lg overflow-hidden"
                    style={{ top: `${cursorPosition.line * 20 + 40}px`, left: `${Math.min(cursorPosition.col * 8 + 60, 300)}px` }}
                  >
                    <div className="text-xs text-text-tertiary px-3 py-1.5 border-b border-border-subtle flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Suggestions
                    </div>
                    {completionItems.map((item, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${i === selectedCompletion ? 'bg-primary/20 text-primary' : 'text-text-primary hover:bg-surface-active'}`}
                        onClick={() => {
                          setShowCompletion(false);
                        }}
                      >
                        <Code className="w-4 h-4 text-text-tertiary" />
                        <span className="font-mono">{item}</span>
                      </div>
                    ))}
                    <div className="text-xs text-text-tertiary px-3 py-1.5 border-t border-border-subtle bg-surface">
                      Tab to accept / Esc to dismiss
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Code className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                  <p className="text-text-secondary">Select a file to edit</p>
                  <p className="text-sm text-text-tertiary mt-1">Click a file from the explorer</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Terminal */}
          {terminalVisible && (
            <div className="h-48 bg-canvas border-t border-border-subtle flex flex-col flex-shrink-0">
              <div className="h-8 bg-surface-elevated border-b border-border-subtle flex items-center justify-between px-3">
                <div className="flex items-center gap-2"><TerminalIcon className="w-4 h-4 text-text-secondary" /><span className="text-sm text-text-primary">Terminal</span></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTerminalOutput([{ type: 'prompt', text: '$ ' }])} className="p-1 hover:bg-surface-active rounded transition-colors"><RefreshCw className="w-3 h-3 text-text-tertiary" /></button>
                  <button onClick={() => setTerminalVisible(false)} className="p-1 hover:bg-surface-active rounded transition-colors"><Minus className="w-3 h-3 text-text-tertiary" /></button>
                </div>
              </div>
              
              <div ref={terminalRef} className="flex-1 overflow-y-auto p-3 font-mono text-sm">
                {terminalOutput.map((line, i) => (
                  <div key={i} className={line.type === 'error' ? 'terminal-error' : line.type === 'success' ? 'terminal-success' : line.type === 'prompt' ? 'terminal-prompt' : line.type === 'info' ? 'text-secondary' : 'terminal-output'}>
                    {line.text}
                  </div>
                ))}
                <form onSubmit={handleTerminalSubmit} className="flex items-center">
                  <span className="terminal-prompt mr-2">$</span>
                  <input type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} className="flex-1 bg-transparent outline-none text-text-primary" autoFocus />
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-surface-elevated border-t border-border-subtle flex items-center justify-between px-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setTerminalVisible(!terminalVisible)} className="flex items-center gap-1 text-text-tertiary hover:text-text-secondary transition-colors">
            <TerminalIcon className="w-3 h-3" /><span>Terminal</span>
          </button>
          <span className="text-text-tertiary">{enabledPlugins.size} plugins active</span>
        </div>
        <div className="flex items-center gap-4">
          {apiStatus === 'valid' && <span className="text-text-tertiary flex items-center gap-1"><Activity className="w-3 h-3" />{apiUsage.tokens.toLocaleString()} tokens</span>}
          <span className="text-text-tertiary">{activeFile ? getLanguage(activeFile).toUpperCase() : 'N/A'}</span>
          <span className="text-text-tertiary">UTF-8</span>
        </div>
      </div>
      
      {/* Plugins Sheet */}
      <BottomSheet isOpen={showPluginsSheet} onClose={() => setShowPluginsSheet(false)} title="Anthropic Plugins">
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {['Core', 'MCP', 'Enterprise'].map(category => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">{category}</h3>
              <div className="space-y-2">
                {ANTHROPIC_PLUGINS.filter(p => p.category === category).map(plugin => (
                  <div key={plugin.id} className={`plugin-card ${enabledPlugins.has(plugin.id) ? 'plugin-card-active' : ''}`} onClick={() => togglePlugin(plugin.id)}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-claude flex items-center justify-center ${enabledPlugins.has(plugin.id) ? 'bg-primary/20' : 'bg-surface-elevated'}`}>
                        <plugin.icon className={`w-5 h-5 ${enabledPlugins.has(plugin.id) ? 'text-primary' : 'text-text-secondary'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-text-primary">{plugin.name}</h4>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${enabledPlugins.has(plugin.id) ? 'border-primary bg-primary' : 'border-text-tertiary'}`}>
                            {enabledPlugins.has(plugin.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary mt-0.5">{plugin.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {plugin.features.map(feature => (
                            <span key={feature} className="px-2 py-0.5 bg-surface-elevated rounded-ios-full text-xs text-text-tertiary">{feature}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
      
      {/* Claude Max Integration Modal */}
      <ClaudeMaxIntegration isOpen={showMaxIntegration} onClose={() => setShowMaxIntegration(false)} />
      
      {/* Claude Code CLI Installer Modal */}
      <ClaudeCodeCLIInstaller isOpen={showCLIInstaller} onClose={() => setShowCLIInstaller(false)} />
    </div>
  );
}
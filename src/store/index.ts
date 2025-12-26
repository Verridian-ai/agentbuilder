import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NodeType = 'agent' | 'action' | 'logic' | 'mcp' | 'network';

export interface AgentNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type: NodeType;
    description?: string;
    config?: Record<string, any>;
    status?: 'idle' | 'running' | 'success' | 'error';
    persona?: string;
    action?: string;
    serverId?: string;
    logicType?: string;
    deviceType?: string;
    vendor?: string;
  };
}

export interface AgentEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    condition?: string;
    parallel?: boolean;
  };
}

export interface Subscription {
  tier: 'free' | 'pro' | 'max' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  apiKey?: string;
  expiresAt?: string;
}

export interface ResearchResult {
  id: string;
  query: string;
  result: string;
  sources?: string[];
  timestamp: string;
}

export interface MCPTemplate {
  id: string;
  name: string;
  description: string;
  vendor?: string;
  category: string;
  code: string;
  config: Record<string, any>;
}

// Claude Max Plan Integration Types
export interface ClaudeMaxConnection {
  status: 'disconnected' | 'detecting' | 'connecting' | 'connected' | 'error';
  planType: 'max5x' | 'max20x' | 'pro' | null;
  sessionToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  email: string | null;
  errorMessage: string | null;
  lastConnected: string | null;
  usageStats: {
    dailyUsage: number;
    weeklyUsage: number;
    monthlyUsage: number;
    limit: number;
  } | null;
}

export interface ClaudeCodeCLI {
  installed: boolean;
  version: string | null;
  installStatus: 'idle' | 'checking' | 'downloading' | 'installing' | 'configuring' | 'complete' | 'error';
  installProgress: number;
  errorMessage: string | null;
  lastChecked: string | null;
  autoUpdateEnabled: boolean;
  configPath: string | null;
}

// Cloud IDE Types
export interface CloudIDEInstance {
  id: string;
  name: string;
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  region: string;
  machineType: string;
  createdAt: string;
  lastActive: string;
  url: string | null;
}

export interface CloudIDEState {
  instances: CloudIDEInstance[];
  activeInstanceId: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  uplinkStatus: 'offline' | 'connecting' | 'online' | 'syncing';
  wsConnection: boolean;
  lastSync: string | null;
  storageUsed: number;
  storageLimit: number;
  errorMessage: string | null;
}

interface AppState {
  // Project state
  currentProjectId: string | null;
  projectName: string;
  setCurrentProject: (id: string | null, name?: string) => void;
  
  // Workflow state
  nodes: AgentNode[];
  edges: AgentEdge[];
  setNodes: (nodes: AgentNode[]) => void;
  setEdges: (edges: AgentEdge[]) => void;
  
  // Configuration
  claudeMd: string;
  setClaudeMd: (content: string) => void;
  toolConfig: Record<string, any>;
  setToolConfig: (config: Record<string, any>) => void;
  selectedMcpServers: string[];
  toggleMcpServer: (serverId: string) => void;
  
  // UI state
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  rightPanelTab: 'properties' | 'claudemd' | 'tools';
  setRightPanelTab: (tab: 'properties' | 'claudemd' | 'tools') => void;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  terminalLogs: string[];
  addTerminalLog: (log: string) => void;
  clearTerminalLogs: () => void;
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  
  // User & Subscription
  user: { id: string; email: string } | null;
  setUser: (user: { id: string; email: string } | null) => void;
  subscription: Subscription;
  setSubscription: (subscription: Subscription) => void;
  
  // API Keys
  openRouterApiKey: string | null;
  setOpenRouterApiKey: (key: string | null) => void;
  claudeCodeApiKey: string | null;
  setClaudeCodeApiKey: (key: string | null) => void;
  
  // Claude Max Plan Integration
  claudeMaxConnection: ClaudeMaxConnection;
  setClaudeMaxConnection: (connection: Partial<ClaudeMaxConnection>) => void;
  claudeCodeCLI: ClaudeCodeCLI;
  setClaudeCodeCLI: (cli: Partial<ClaudeCodeCLI>) => void;
  
  // Cloud IDE
  cloudIDE: CloudIDEState;
  setCloudIDE: (state: Partial<CloudIDEState>) => void;
  addCloudInstance: (instance: CloudIDEInstance) => void;
  removeCloudInstance: (id: string) => void;
  setActiveInstance: (id: string | null) => void;
  
  // Research
  researchHistory: ResearchResult[];
  addResearchResult: (result: ResearchResult) => void;
  clearResearchHistory: () => void;
  isResearching: boolean;
  setIsResearching: (loading: boolean) => void;
  
  // MCP Builder
  mcpTemplates: MCPTemplate[];
  addMcpTemplate: (template: MCPTemplate) => void;
  removeMcpTemplate: (id: string) => void;
  selectedMcpTemplate: string | null;
  setSelectedMcpTemplate: (id: string | null) => void;
  
  // Network Automation
  networkDevices: Array<{ id: string; name: string; vendor: string; ip: string; status: string }>;
  addNetworkDevice: (device: { id: string; name: string; vendor: string; ip: string; status: string }) => void;
  removeNetworkDevice: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Project state
      currentProjectId: null,
      projectName: 'Untitled Agent',
      setCurrentProject: (id, name) =>
        set({ currentProjectId: id, projectName: name || 'Untitled Agent' }),
      
      // Workflow state
      nodes: [],
      edges: [],
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      
      // Configuration
      claudeMd: `# Project: My Agent

## IDENTITY
You are an AI assistant focused on helping with development tasks.

## WORKFLOW
1. Understand the task requirements
2. Plan the approach
3. Execute step by step
4. Verify the results

## RULES
- Follow best practices
- Write clean, maintainable code
- Test your changes
- Document your work
`,
      setClaudeMd: (claudeMd) => set({ claudeMd }),
      toolConfig: {
        allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
      },
      setToolConfig: (toolConfig) => set({ toolConfig }),
      selectedMcpServers: [],
      toggleMcpServer: (serverId) => set((state) => ({
        selectedMcpServers: state.selectedMcpServers.includes(serverId)
          ? state.selectedMcpServers.filter(id => id !== serverId)
          : [...state.selectedMcpServers, serverId]
      })),
      
      // UI state
      selectedNodeId: null,
      setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
      rightPanelTab: 'properties',
      setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
      terminalOpen: false,
      setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
      terminalLogs: [],
      addTerminalLog: (log) =>
        set((state) => ({ terminalLogs: [...state.terminalLogs, log] })),
      clearTerminalLogs: () => set({ terminalLogs: [] }),
      exportModalOpen: false,
      setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }),
      
      // User & Subscription
      user: null,
      setUser: (user) => set({ user }),
      subscription: {
        tier: 'free',
        status: 'inactive',
      },
      setSubscription: (subscription) => set({ subscription }),
      
      // API Keys
      openRouterApiKey: null,
      setOpenRouterApiKey: (openRouterApiKey) => set({ openRouterApiKey }),
      claudeCodeApiKey: null,
      setClaudeCodeApiKey: (claudeCodeApiKey) => set({ claudeCodeApiKey }),
      
      // Claude Max Plan Integration
      claudeMaxConnection: {
        status: 'disconnected',
        planType: null,
        sessionToken: null,
        refreshToken: null,
        expiresAt: null,
        email: null,
        errorMessage: null,
        lastConnected: null,
        usageStats: null,
      },
      setClaudeMaxConnection: (connection) =>
        set((state) => ({
          claudeMaxConnection: { ...state.claudeMaxConnection, ...connection },
        })),
      claudeCodeCLI: {
        installed: false,
        version: null,
        installStatus: 'idle',
        installProgress: 0,
        errorMessage: null,
        lastChecked: null,
        autoUpdateEnabled: true,
        configPath: null,
      },
      setClaudeCodeCLI: (cli) =>
        set((state) => ({
          claudeCodeCLI: { ...state.claudeCodeCLI, ...cli },
        })),
      
      // Cloud IDE
      cloudIDE: {
        instances: [],
        activeInstanceId: null,
        connectionStatus: 'disconnected',
        uplinkStatus: 'offline',
        wsConnection: false,
        lastSync: null,
        storageUsed: 0,
        storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
        errorMessage: null,
      },
      setCloudIDE: (state) =>
        set((prev) => ({
          cloudIDE: { ...prev.cloudIDE, ...state },
        })),
      addCloudInstance: (instance) =>
        set((state) => ({
          cloudIDE: {
            ...state.cloudIDE,
            instances: [...state.cloudIDE.instances, instance],
          },
        })),
      removeCloudInstance: (id) =>
        set((state) => ({
          cloudIDE: {
            ...state.cloudIDE,
            instances: state.cloudIDE.instances.filter(i => i.id !== id),
          },
        })),
      setActiveInstance: (id) =>
        set((state) => ({
          cloudIDE: { ...state.cloudIDE, activeInstanceId: id },
        })),
      
      // Research
      researchHistory: [],
      addResearchResult: (result) =>
        set((state) => ({ researchHistory: [result, ...state.researchHistory].slice(0, 50) })),
      clearResearchHistory: () => set({ researchHistory: [] }),
      isResearching: false,
      setIsResearching: (isResearching) => set({ isResearching }),
      
      // MCP Builder
      mcpTemplates: [],
      addMcpTemplate: (template) =>
        set((state) => ({ mcpTemplates: [...state.mcpTemplates, template] })),
      removeMcpTemplate: (id) =>
        set((state) => ({ mcpTemplates: state.mcpTemplates.filter(t => t.id !== id) })),
      selectedMcpTemplate: null,
      setSelectedMcpTemplate: (selectedMcpTemplate) => set({ selectedMcpTemplate }),
      
      // Network Automation
      networkDevices: [],
      addNetworkDevice: (device) =>
        set((state) => ({ networkDevices: [...state.networkDevices, device] })),
      removeNetworkDevice: (id) =>
        set((state) => ({ networkDevices: state.networkDevices.filter(d => d.id !== id) })),
    }),
    {
      name: 'agent-builder-storage',
      partialize: (state) => ({
        openRouterApiKey: state.openRouterApiKey,
        claudeCodeApiKey: state.claudeCodeApiKey,
        subscription: state.subscription,
        researchHistory: state.researchHistory,
        mcpTemplates: state.mcpTemplates,
        networkDevices: state.networkDevices,
        claudeMaxConnection: state.claudeMaxConnection,
        claudeCodeCLI: state.claudeCodeCLI,
        cloudIDE: state.cloudIDE,
      }),
    }
  )
);

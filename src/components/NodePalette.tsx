import { User, Zap, GitBranch, FileCode, Terminal, Search, FolderOpen, GitCommit,
  Compass, Code, CheckCircle, Bug, TestTube, FileText, Shield, Database,
  Globe, MessageSquare, Brain, Github, Server } from 'lucide-react';
import { agentPersonas, mcpServers } from '../lib/db';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string, label: string, meta?: Record<string, any>) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass, Code, CheckCircle, Bug, TestTube, FileText, Shield, Zap,
  Database, Globe, MessageSquare, Brain, Github, FolderOpen, Server, User
};

const nodeCategories = [
  {
    name: 'Agent Personas', description: 'Specialized AI agents',
    nodes: agentPersonas.map(persona => ({
      type: 'agent', label: persona.name, description: persona.description,
      icon: iconMap[persona.icon] || User, color: persona.color,
      meta: { persona: persona.id },
    })),
  },
  {
    name: 'MCP Servers', description: 'External tool integrations',
    nodes: mcpServers.map(server => ({
      type: 'mcp', label: server.name, description: server.description,
      icon: iconMap[server.icon] || Server, color: 'blue',
      meta: { serverId: server.id },
    })),
  },
  {
    name: 'Actions', description: 'Tool operations',
    nodes: [
      { type: 'action', label: 'Read File', description: 'Read file contents', icon: FileCode, color: 'green', meta: { action: 'read' } },
      { type: 'action', label: 'Write File', description: 'Write or create files', icon: FileCode, color: 'green', meta: { action: 'write' } },
      { type: 'action', label: 'Run Bash', description: 'Execute commands', icon: Terminal, color: 'green', meta: { action: 'bash' } },
      { type: 'action', label: 'Search Code', description: 'Regex search', icon: Search, color: 'green', meta: { action: 'grep' } },
      { type: 'action', label: 'List Files', description: 'Directory listing', icon: FolderOpen, color: 'green', meta: { action: 'glob' } },
      { type: 'action', label: 'Git Commit', description: 'Commit changes', icon: GitCommit, color: 'green', meta: { action: 'git' } },
    ],
  },
  {
    name: 'Logic', description: 'Control flow',
    nodes: [
      { type: 'logic', label: 'Condition', description: 'Branch on condition', icon: GitBranch, color: 'gray', meta: { logicType: 'condition' } },
      { type: 'logic', label: 'Loop', description: 'Repeat actions', icon: GitBranch, color: 'gray', meta: { logicType: 'loop' } },
      { type: 'logic', label: 'Parallel', description: 'Execute in parallel', icon: Zap, color: 'gray', meta: { logicType: 'parallel' } },
      { type: 'logic', label: 'Aggregate', description: 'Combine results', icon: GitBranch, color: 'gray', meta: { logicType: 'aggregate' } },
    ],
  },
];

const colorClasses: Record<string, string> = {
  orange: 'bg-claude-orange/15 text-claude-orange border-claude-orange/30 hover:bg-claude-orange/25',
  blue: 'bg-claude-blue/15 text-claude-blue border-claude-blue/30 hover:bg-claude-blue/25',
  green: 'bg-claude-green/15 text-claude-green border-claude-green/30 hover:bg-claude-green/25',
  gray: 'bg-claude-gray/15 text-claude-gray border-claude-gray/30 hover:bg-claude-gray/25',
};

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="w-[280px] bg-surface border-r border-border-subtle flex flex-col h-full">
      <div className="p-4 border-b border-border-subtle">
        <h2 className="text-lg font-heading font-semibold text-text-primary">Components</h2>
        <p className="text-xs text-text-tertiary mt-1 font-body">Drag to canvas to add</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {nodeCategories.map((category) => (
          <div key={category.name}>
            <div className="mb-2 px-1">
              <h3 className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider">{category.name}</h3>
              <p className="text-xs text-text-tertiary mt-0.5">{category.description}</p>
            </div>
            <div className="space-y-1.5">
              {category.nodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div key={`${node.type}-${node.label}`} draggable
                    onDragStart={(e) => onDragStart(e, node.type, node.label, node.meta)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab border ${colorClasses[node.color]} transition-all duration-150 hover:shadow-sm`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{node.label}</span>
                      <span className="text-xs opacity-70 block truncate">{node.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

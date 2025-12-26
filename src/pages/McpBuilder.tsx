import { useState } from 'react';
import { NavBar, BottomSheet } from '../components/MobileNavigation';
import { Box, GitBranch, Play, Upload, Plus, ChevronRight, Sparkles, Database, Check, Trash2, Copy, Code } from 'lucide-react';
import { useStore } from '../store';

const MCP_TEMPLATES = {
  filesystem: {
    name: 'Filesystem Server',
    code: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'filesystem-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    { name: 'read_file', description: 'Read file contents', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } },
    { name: 'write_file', description: 'Write to file', inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } } } },
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);`,
  },
  github: {
    name: 'GitHub Server',
    code: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'github-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    { name: 'search_repos', description: 'Search GitHub repositories', inputSchema: { type: 'object', properties: { query: { type: 'string' } } } },
    { name: 'get_repo', description: 'Get repository details', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' } } } },
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);`,
  },
  database: {
    name: 'Database Server',
    code: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'database-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    { name: 'query', description: 'Execute SQL query', inputSchema: { type: 'object', properties: { sql: { type: 'string' } } } },
    { name: 'list_tables', description: 'List database tables', inputSchema: { type: 'object', properties: {} } },
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);`,
  },
  custom: {
    name: 'Custom Server',
    code: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'custom-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Add your custom tools here
server.setRequestHandler('tools/list', async () => ({
  tools: [
    { name: 'my_tool', description: 'Your custom tool', inputSchema: { type: 'object', properties: {} } },
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  // Implement your tool logic
  return { content: [{ type: 'text', text: 'Tool result' }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);`,
  },
};

export default function McpBuilderPage() {
  const { mcpTemplates, addMcpTemplate, removeMcpTemplate } = useStore();
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mcpTemplates[0] | null>(null);
  const [selectedType, setSelectedType] = useState<keyof typeof MCP_TEMPLATES | null>(null);
  const [newServerName, setNewServerName] = useState('');

  const serverTypes = [
    { id: 'filesystem' as const, name: 'Filesystem', desc: 'Local file operations', icon: Box, color: 'text-ios-blue' },
    { id: 'github' as const, name: 'GitHub', desc: 'Repository management', icon: GitBranch, color: 'text-ios-purple' },
    { id: 'database' as const, name: 'Database', desc: 'SQL/NoSQL operations', icon: Database, color: 'text-ios-green' },
    { id: 'custom' as const, name: 'Custom', desc: 'Build from scratch', icon: Sparkles, color: 'text-ios-orange' },
  ];

  const handleSelectType = (typeId: keyof typeof MCP_TEMPLATES) => {
    setSelectedType(typeId);
    setNewServerName(MCP_TEMPLATES[typeId].name);
    setShowCreateSheet(true);
  };

  const handleCreateServer = () => {
    if (!selectedType || !newServerName) return;

    const template = MCP_TEMPLATES[selectedType];
    addMcpTemplate({
      id: crypto.randomUUID(),
      name: newServerName,
      description: `${selectedType} MCP server`,
      category: selectedType,
      code: template.code,
      config: {},
    });

    setShowCreateSheet(false);
    setSelectedType(null);
    setNewServerName('');
  };

  const viewTemplate = (template: typeof mcpTemplates[0]) => {
    setSelectedTemplate(template);
    setShowDetailSheet(true);
  };

  const handleDeleteTemplate = (id: string) => {
    removeMcpTemplate(id);
    setShowDetailSheet(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-canvas pb-24">
      <NavBar title="MCP Builder" large />
      
      <div className="px-4 space-y-6">
        {/* MCP Server Templates */}
        <section>
          <h2 className="text-ios-headline font-semibold mb-3">Create New Server</h2>
          <div className="grid grid-cols-2 gap-3">
            {serverTypes.map(type => (
              <button
                key={type.id}
                onClick={() => handleSelectType(type.id)}
                className="ios-card flex flex-col items-start active:bg-surface-active"
              >
                <type.icon className={`w-8 h-8 ${type.color} mb-2`} />
                <p className="text-ios-body font-medium text-text-primary">{type.name}</p>
                <p className="text-ios-caption2 text-text-tertiary">{type.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Dev Actions */}
        <section className="ios-card">
          <h2 className="text-ios-headline font-semibold mb-4">Development</h2>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 p-3 rounded-ios active:bg-surface-active">
              <Play className="w-5 h-5 text-ios-green" />
              <span className="text-ios-body text-text-primary">Test Server</span>
              <ChevronRight className="w-5 h-5 text-text-tertiary ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-ios active:bg-surface-active">
              <Upload className="w-5 h-5 text-ios-blue" />
              <span className="text-ios-body text-text-primary">Deploy Server</span>
              <ChevronRight className="w-5 h-5 text-text-tertiary ml-auto" />
            </button>
          </div>
        </section>

        {/* My MCP Servers */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-headline font-semibold">My Servers</h2>
            <button 
              onClick={() => {
                setSelectedType('custom');
                setNewServerName('Custom Server');
                setShowCreateSheet(true);
              }}
              className="text-ios-blue text-ios-subhead flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
          
          {mcpTemplates.length === 0 ? (
            <div className="ios-card text-center py-8">
              <Box className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary text-ios-body">No MCP servers</p>
              <p className="text-text-tertiary text-ios-caption1 mt-1">Create your first MCP server</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mcpTemplates.map(template => (
                <button 
                  key={template.id}
                  onClick={() => viewTemplate(template)}
                  className="ios-card w-full flex items-center gap-4 active:bg-surface-active"
                >
                  <div className="w-10 h-10 rounded-ios bg-ios-purple/10 flex items-center justify-center">
                    <Box className="w-5 h-5 text-ios-purple" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-ios-body font-medium text-text-primary">{template.name}</p>
                    <p className="text-ios-caption1 text-text-tertiary">{template.category}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-tertiary" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Server Sheet */}
      <BottomSheet isOpen={showCreateSheet} onClose={() => setShowCreateSheet(false)} title="Create MCP Server">
        <div className="p-4 space-y-4">
          {selectedType && (
            <>
              <div className="bg-surface-secondary rounded-ios-lg p-3 flex items-center gap-3">
                <Code className="w-6 h-6 text-ios-purple" />
                <div>
                  <p className="text-ios-body font-medium text-text-primary">{selectedType} template</p>
                  <p className="text-ios-caption1 text-text-tertiary">Pre-configured MCP server</p>
                </div>
              </div>

              <div>
                <label className="text-ios-footnote font-medium text-text-secondary block mb-2">Server Name</label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="e.g., My Custom Server"
                  className="ios-input"
                />
              </div>

              <div>
                <label className="text-ios-footnote font-medium text-text-secondary block mb-2">Template Preview</label>
                <pre className="bg-surface-secondary rounded-ios-lg p-3 text-xs text-text-primary overflow-x-auto font-mono max-h-48">
                  {MCP_TEMPLATES[selectedType].code.slice(0, 500)}...
                </pre>
              </div>

              <button
                onClick={handleCreateServer}
                disabled={!newServerName}
                className="w-full ios-button-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Create Server
              </button>
            </>
          )}
        </div>
      </BottomSheet>

      {/* Server Detail Sheet */}
      <BottomSheet isOpen={showDetailSheet} onClose={() => setShowDetailSheet(false)} title={selectedTemplate?.name || 'Server'}>
        {selectedTemplate && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-secondary rounded-ios-lg p-3">
                <p className="text-ios-caption1 text-text-tertiary">Category</p>
                <p className="text-ios-body font-medium text-text-primary capitalize">{selectedTemplate.category}</p>
              </div>
              <div className="bg-surface-secondary rounded-ios-lg p-3">
                <p className="text-ios-caption1 text-text-tertiary">Type</p>
                <p className="text-ios-body font-medium text-text-primary">MCP Server</p>
              </div>
            </div>

            <div>
              <p className="text-ios-footnote font-medium text-text-secondary mb-2">Server Code</p>
              <pre className="bg-surface-secondary rounded-ios-lg p-3 text-xs text-text-primary overflow-x-auto font-mono max-h-64">
                {selectedTemplate.code}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(selectedTemplate.code)}
                className="flex-1 ios-button-primary flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copy Code
              </button>
              <button
                onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                className="w-12 h-12 rounded-ios-lg bg-ios-red/10 flex items-center justify-center text-ios-red"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

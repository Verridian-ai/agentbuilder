// MCP Server configurations
export const mcpServers = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repository management, issues, PRs',
    icon: 'Github',
    transport: 'stdio',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: '${GITHUB_TOKEN}' },
    },
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'File system operations',
    icon: 'FolderOpen',
    transport: 'stdio',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/files'],
    },
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Database queries and management',
    icon: 'Database',
    transport: 'stdio',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', '${DATABASE_URL}'],
    },
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    description: 'Browser automation and web scraping',
    icon: 'Globe',
    transport: 'stdio',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    },
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication integration',
    icon: 'MessageSquare',
    transport: 'stdio',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-slack'],
      env: { SLACK_BOT_TOKEN: '${SLACK_TOKEN}' },
    },
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent knowledge graph',
    icon: 'Brain',
    transport: 'stdio',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
    },
  },
];

// Agent persona templates
export const agentPersonas = [
  { id: 'architect', name: 'Architect', description: 'System design and planning', color: 'orange', icon: 'Compass' },
  { id: 'developer', name: 'Developer', description: 'Code implementation', color: 'blue', icon: 'Code' },
  { id: 'reviewer', name: 'Reviewer', description: 'Code quality and review', color: 'green', icon: 'CheckCircle' },
  { id: 'debugger', name: 'Debugger', description: 'Bug analysis and fixing', color: 'orange', icon: 'Bug' },
  { id: 'tester', name: 'Tester', description: 'Test creation and coverage', color: 'blue', icon: 'TestTube' },
  { id: 'documenter', name: 'Documenter', description: 'Documentation and guides', color: 'green', icon: 'FileText' },
  { id: 'security', name: 'Security', description: 'Security analysis', color: 'orange', icon: 'Shield' },
  { id: 'optimizer', name: 'Optimizer', description: 'Performance optimization', color: 'blue', icon: 'Zap' },
];

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  content: {
    nodes: any[];
    edges: any[];
    claudeMd: string;
    toolConfig: Record<string, any>;
  };
  is_public: boolean;
  downloads: number;
  created_at: string;
}

// Pre-built workflow templates
export const defaultTemplates: Template[] = [
  {
    id: 'tpl-tdd',
    name: 'Test-Driven Development',
    description: 'Agent optimized for TDD workflow with test generation and code implementation',
    category: 'Development',
    content: {
      nodes: [
        { id: '1', type: 'agent', position: { x: 100, y: 150 }, data: { label: 'TDD Architect', persona: 'architect' } },
        { id: '2', type: 'action', position: { x: 300, y: 100 }, data: { label: 'Generate Tests', action: 'write' } },
        { id: '3', type: 'action', position: { x: 500, y: 100 }, data: { label: 'Implement Code', action: 'write' } },
        { id: '4', type: 'logic', position: { x: 500, y: 200 }, data: { label: 'Tests Pass?', logicType: 'condition' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
      claudeMd: `# TDD Agent Configuration

## IDENTITY
You are a Test-Driven Development specialist.

## WORKFLOW
1. Write failing tests first (RED)
2. Implement minimum code to pass (GREEN)
3. Refactor while keeping tests green

## RULES
- Never write implementation before tests
- Run tests after every change
- Target 80%+ code coverage
`,
      toolConfig: { allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep'] },
    },
    is_public: true,
    downloads: 256,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'tpl-debug',
    name: 'Debugging Expert',
    description: 'Systematic debugging agent with root cause analysis capabilities',
    category: 'Debugging',
    content: {
      nodes: [
        { id: '1', type: 'agent', position: { x: 100, y: 150 }, data: { label: 'Debug Analyst', persona: 'debugger' } },
        { id: '2', type: 'action', position: { x: 300, y: 80 }, data: { label: 'Reproduce Error', action: 'bash' } },
        { id: '3', type: 'action', position: { x: 300, y: 220 }, data: { label: 'Search Codebase', action: 'grep' } },
        { id: '4', type: 'action', position: { x: 500, y: 150 }, data: { label: 'Apply Fix', action: 'write' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2-4', source: '2', target: '4' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
      claudeMd: `# Debugging Agent Configuration

## IDENTITY
You are a systematic debugging specialist.

## WORKFLOW
1. Reproduce the issue consistently
2. Gather evidence (logs, stack traces)
3. Form hypothesis about root cause
4. Implement fix and verify
`,
      toolConfig: { allowedTools: ['Read', 'Write', 'Grep', 'Bash', 'Glob'] },
    },
    is_public: true,
    downloads: 312,
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'tpl-multi-agent',
    name: 'Multi-Agent Pipeline',
    description: 'Parallel agent workflow with orchestration for complex tasks',
    category: 'Advanced',
    content: {
      nodes: [
        { id: '1', type: 'agent', position: { x: 100, y: 200 }, data: { label: 'Orchestrator', persona: 'architect' } },
        { id: '2', type: 'agent', position: { x: 350, y: 80 }, data: { label: 'Code Agent', persona: 'developer' } },
        { id: '3', type: 'agent', position: { x: 350, y: 200 }, data: { label: 'Test Agent', persona: 'tester' } },
        { id: '4', type: 'agent', position: { x: 350, y: 320 }, data: { label: 'Review Agent', persona: 'reviewer' } },
        { id: '5', type: 'logic', position: { x: 600, y: 200 }, data: { label: 'Aggregate', logicType: 'aggregate' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', data: { parallel: true } },
        { id: 'e1-3', source: '1', target: '3', data: { parallel: true } },
        { id: 'e1-4', source: '1', target: '4', data: { parallel: true } },
        { id: 'e2-5', source: '2', target: '5' },
        { id: 'e3-5', source: '3', target: '5' },
        { id: 'e4-5', source: '4', target: '5' },
      ],
      claudeMd: `# Multi-Agent Pipeline Configuration

## IDENTITY
You are an orchestrator coordinating specialized sub-agents.

## AGENTS
- Code Agent: Implementation
- Test Agent: Test creation
- Review Agent: Quality review

## COORDINATION
- Use structured handoff messages
- Each agent has isolated context
- Orchestrator resolves conflicts
`,
      toolConfig: { allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep'], parallelExecution: true },
    },
    is_public: true,
    downloads: 189,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'tpl-review',
    name: 'Code Reviewer',
    description: 'Thorough code review agent focusing on quality and best practices',
    category: 'Review',
    content: {
      nodes: [
        { id: '1', type: 'agent', position: { x: 100, y: 150 }, data: { label: 'Code Reviewer', persona: 'reviewer' } },
        { id: '2', type: 'action', position: { x: 300, y: 80 }, data: { label: 'Check Style', action: 'grep' } },
        { id: '3', type: 'action', position: { x: 300, y: 220 }, data: { label: 'Check Logic', action: 'read' } },
        { id: '4', type: 'action', position: { x: 500, y: 150 }, data: { label: 'Generate Report', action: 'write' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2-4', source: '2', target: '4' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
      claudeMd: `# Code Review Agent

## IDENTITY
You are a thorough code reviewer.

## CHECKLIST
- Code follows style guide
- Logic handles edge cases
- Error handling is appropriate
- No security vulnerabilities
`,
      toolConfig: { allowedTools: ['Read', 'Grep', 'Glob'] },
    },
    is_public: true,
    downloads: 267,
    created_at: '2024-02-10T00:00:00Z',
  },
  {
    id: 'tpl-deploy',
    name: 'Deployment Pipeline',
    description: 'CI/CD focused agent for deployment automation',
    category: 'DevOps',
    content: {
      nodes: [
        { id: '1', type: 'agent', position: { x: 100, y: 150 }, data: { label: 'Deploy Manager', persona: 'architect' } },
        { id: '2', type: 'action', position: { x: 300, y: 150 }, data: { label: 'Run Tests', action: 'bash' } },
        { id: '3', type: 'logic', position: { x: 500, y: 150 }, data: { label: 'Tests Pass?', logicType: 'condition' } },
        { id: '4', type: 'action', position: { x: 700, y: 80 }, data: { label: 'Deploy', action: 'bash' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
      claudeMd: `# Deployment Agent

## IDENTITY
You are a deployment automation specialist.

## WORKFLOW
1. Run full test suite
2. Build production artifacts
3. Deploy with health checks
4. Monitor for issues
`,
      toolConfig: { allowedTools: ['Read', 'Bash', 'Glob'] },
    },
    is_public: true,
    downloads: 198,
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'tpl-security',
    name: 'Security Auditor',
    description: 'Security-focused agent for vulnerability detection',
    category: 'Security',
    content: {
      nodes: [
        { id: '1', type: 'agent', position: { x: 100, y: 150 }, data: { label: 'Security Analyst', persona: 'security' } },
        { id: '2', type: 'action', position: { x: 300, y: 80 }, data: { label: 'Dependency Scan', action: 'bash' } },
        { id: '3', type: 'action', position: { x: 300, y: 220 }, data: { label: 'Code Analysis', action: 'grep' } },
        { id: '4', type: 'mcp', position: { x: 500, y: 150 }, data: { label: 'GitHub Security', serverId: 'github' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2-4', source: '2', target: '4' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
      claudeMd: `# Security Audit Agent

## IDENTITY
You are a security specialist.

## SCAN AREAS
- Dependency vulnerabilities
- Hardcoded secrets
- SQL injection vectors
- XSS vulnerabilities
`,
      toolConfig: { allowedTools: ['Read', 'Grep', 'Bash', 'Glob'] },
    },
    is_public: true,
    downloads: 156,
    created_at: '2024-02-20T00:00:00Z',
  },
];

// Script generation
export function generateSetupScript(config: {
  claudeMd: string;
  toolConfig: Record<string, any>;
  mcpServers?: string[];
}): string {
  return `#!/bin/bash
# Claude Code Agent Setup Script
# Generated by Claude Agent Builder

set -e

echo "Setting up Claude Code Agent configuration..."

mkdir -p .claude

cat > CLAUDE.md << 'CLAUDEMD_EOF'
${config.claudeMd}
CLAUDEMD_EOF

echo "Created CLAUDE.md"

cat > .claude/settings.json << 'SETTINGS_EOF'
{
  "permissions": {
    "allow": [${(config.toolConfig.allowedTools || []).map((t: string) => `"${t}"`).join(', ')}],
    "deny": []
  },
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 8192
}
SETTINGS_EOF

echo "Created .claude/settings.json"
${config.mcpServers?.length ? `
cat > .mcp.json << 'MCP_EOF'
{
  "mcpServers": {
${config.mcpServers.map(serverId => {
  const server = mcpServers.find(s => s.id === serverId);
  if (!server) return '';
  return `    "${server.id}": ${JSON.stringify(server.config, null, 6).split('\n').join('\n    ')}`;
}).filter(Boolean).join(',\n')}
  }
}
MCP_EOF

echo "Created .mcp.json"` : ''}

echo ""
echo "Setup complete! Run 'claude' to start."
`;
}

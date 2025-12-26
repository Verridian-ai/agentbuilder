import { useState } from 'react';
import { Settings, FileCode, Wrench, Sparkles, AlertCircle, CheckCircle, Server, Plus } from 'lucide-react';
import { useStore } from '../store';
import { generateClaudeMd, optimizeClaudeMd, estimateTokens, getContextStatus } from '../lib/ai';
import { agentPersonas, mcpServers } from '../lib/db';

export default function ConfigPanel() {
  const { rightPanelTab, setRightPanelTab, claudeMd, setClaudeMd, toolConfig, setToolConfig,
    selectedNodeId, nodes, selectedMcpServers, toggleMcpServer } = useStore();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRequirements, setAiRequirements] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const contextTokens = estimateTokens(claudeMd);
  const contextStatus = getContextStatus(contextTokens);

  const handleGenerateClaudeMd = async () => {
    if (!aiRequirements.trim()) return;
    setAiLoading(true);
    try {
      const generated = await generateClaudeMd(aiRequirements);
      setClaudeMd(generated);
      setAiRequirements('');
    } finally { setAiLoading(false); }
  };

  const handleOptimize = async () => {
    setAiLoading(true);
    try {
      const result = await optimizeClaudeMd(claudeMd);
      setSuggestions(result.suggestions);
      if (result.optimizedContent !== claudeMd) setClaudeMd(result.optimizedContent);
    } finally { setAiLoading(false); }
  };

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Settings },
    { id: 'claudemd', label: 'CLAUDE.md', icon: FileCode },
    { id: 'tools', label: 'Tools', icon: Wrench },
  ] as const;

  const statusColors: Record<string, string> = {
    low: 'text-success bg-success/10 border-success/20',
    medium: 'text-warning bg-warning/10 border-warning/20',
    high: 'text-danger bg-danger/10 border-danger/20',
  };

  const tools = ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'LS'];

  return (
    <div className="w-[340px] bg-surface border-l border-border-subtle flex flex-col h-full">
      <div className="flex border-b border-border-subtle">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setRightPanelTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-3.5 text-sm font-heading font-medium transition-colors duration-150
                ${rightPanelTab === tab.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'}`}>
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {rightPanelTab === 'properties' && (
          <div className="p-4 space-y-4">
            {selectedNode ? (
              <>
                <div className="p-4 bg-surface-elevated rounded-xl border border-border-subtle">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedNode.type === 'agent' ? 'bg-claude-orange/10' :
                      selectedNode.type === 'mcp' ? 'bg-claude-blue/10' :
                      selectedNode.type === 'action' ? 'bg-claude-green/10' : 'bg-claude-gray/10'}`}>
                      <span className={`text-lg font-heading font-bold ${
                        selectedNode.type === 'agent' ? 'text-claude-orange' :
                        selectedNode.type === 'mcp' ? 'text-claude-blue' :
                        selectedNode.type === 'action' ? 'text-claude-green' : 'text-claude-gray'}`}>
                        {selectedNode.data.label.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-text-primary">{selectedNode.data.label}</p>
                      <p className="text-xs text-text-tertiary uppercase">{selectedNode.type}</p>
                    </div>
                  </div>
                  {selectedNode.data.persona && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <label className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider">Persona</label>
                      <p className="text-sm text-text-primary mt-1">{agentPersonas.find(p => p.id === selectedNode.data.persona)?.name}</p>
                    </div>
                  )}
                  {selectedNode.data.serverId && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <label className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider">MCP Server</label>
                      <p className="text-sm text-text-primary mt-1">{mcpServers.find(s => s.id === selectedNode.data.serverId)?.name}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider">Description</label>
                  <textarea placeholder="Add description for this node..." className="w-full mt-2 px-3 py-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-24" />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center">
                  <Settings className="w-8 h-8 text-text-tertiary" />
                </div>
                <p className="text-text-secondary font-heading font-medium">Select a node</p>
                <p className="text-sm text-text-tertiary mt-1">Click on a node to view and edit its properties</p>
              </div>
            )}
          </div>
        )}

        {rightPanelTab === 'claudemd' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border-subtle space-y-3">
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${statusColors[contextStatus]}`}>
                {contextStatus === 'high' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span className="text-sm font-heading font-medium">~{contextTokens.toLocaleString()} tokens</span>
                <span className="text-xs opacity-70">{contextStatus === 'high' ? 'Consider optimizing' : 'Good'}</span>
              </div>
              <div className="space-y-2">
                <textarea value={aiRequirements} onChange={(e) => setAiRequirements(e.target.value)}
                  placeholder="Describe your agent requirements..."
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary text-sm font-body focus:border-primary outline-none resize-none h-20" />
                <div className="flex gap-2">
                  <button onClick={handleGenerateClaudeMd} disabled={aiLoading || !aiRequirements.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-heading font-medium disabled:opacity-50 transition-colors">
                    <Sparkles className="w-4 h-4" />
                    {aiLoading ? 'Generating...' : 'AI Generate'}
                  </button>
                  <button onClick={handleOptimize} disabled={aiLoading}
                    className="px-4 py-2.5 bg-surface-elevated hover:bg-surface-active border border-border-subtle text-text-primary rounded-xl text-sm font-heading font-medium disabled:opacity-50 transition-colors">
                    Optimize
                  </button>
                </div>
              </div>
              {suggestions.length > 0 && (
                <div className="bg-info/10 border border-info/20 rounded-xl p-3">
                  <p className="text-xs font-heading font-semibold text-info mb-2">Suggestions:</p>
                  <ul className="text-xs text-text-secondary space-y-1 font-body">
                    {suggestions.map((s, i) => <li key={i}>- {s}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 p-4">
              <textarea value={claudeMd} onChange={(e) => setClaudeMd(e.target.value)}
                className="w-full h-full min-h-[300px] px-4 py-3 bg-terminal border border-border-subtle rounded-xl text-text-primary font-mono text-sm focus:border-primary outline-none resize-none" spellCheck={false} />
            </div>
          </div>
        )}

        {rightPanelTab === 'tools' && (
          <div className="p-4 space-y-5">
            <div>
              <label className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider">Allowed Tools</label>
              <div className="mt-3 space-y-2">
                {tools.map((tool) => (
                  <label key={tool} className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl border border-border-subtle hover:border-border-focus cursor-pointer transition-colors">
                    <input type="checkbox" checked={(toolConfig.allowedTools as string[])?.includes(tool) ?? true}
                      onChange={(e) => {
                        const current = (toolConfig.allowedTools as string[]) || [];
                        const updated = e.target.checked ? [...current, tool] : current.filter((t) => t !== tool);
                        setToolConfig({ ...toolConfig, allowedTools: updated });
                      }}
                      className="w-4 h-4 rounded border-border-subtle bg-surface text-primary focus:ring-primary" />
                    <span className="text-sm text-text-primary font-mono">{tool}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider">MCP Servers</label>
                <span className="text-xs text-text-tertiary">{selectedMcpServers.length} selected</span>
              </div>
              <div className="space-y-2">
                {mcpServers.map((server) => (
                  <label key={server.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${selectedMcpServers.includes(server.id) ? 'border-claude-blue bg-claude-blue/5' : 'border-border-subtle bg-surface-elevated hover:border-border-focus'}`}>
                    <input type="checkbox" checked={selectedMcpServers.includes(server.id)} onChange={() => toggleMcpServer(server.id)}
                      className="mt-0.5 w-4 h-4 rounded border-border-subtle bg-surface text-primary focus:ring-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-claude-blue" />
                        <span className="text-sm font-heading font-medium text-text-primary">{server.name}</span>
                      </div>
                      <span className="text-xs text-text-tertiary block mt-0.5">{server.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-heading font-semibold text-text-secondary uppercase tracking-wider">Custom Commands</label>
              <div className="mt-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border-focus text-text-secondary hover:text-text-primary hover:border-primary rounded-xl text-sm font-heading transition-colors">
                  <Plus className="w-4 h-4" />Add Custom Command
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

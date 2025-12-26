import { useState } from 'react';
import { X, Download, Copy, Check, Share } from 'lucide-react';
import { useStore } from '../store';
import { mcpServers } from '../lib/db';

interface ScriptExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScriptExportModal({ isOpen, onClose }: ScriptExportModalProps) {
  const { projectName, claudeMd, nodes, edges, selectedMcpServers, toolConfig } = useStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'claudemd' | 'mcp'>('setup');

  if (!isOpen) return null;

  const generateSetupScript = () => {
    const selectedServers = mcpServers.filter(s => selectedMcpServers.includes(s.id));
    
    return `#!/bin/bash
# Claude Agent Builder - Setup Script
# Project: ${projectName}
# Generated: ${new Date().toISOString()}

echo "Setting up Claude Code environment..."

# Create project directory
mkdir -p .claude
cd .claude

# Create CLAUDE.md configuration
cat > CLAUDE.md << 'CLAUDEMD'
${claudeMd}
CLAUDEMD

# Create settings.json
cat > settings.json << 'SETTINGS'
{
  "project": "${projectName}",
  "tools": {
    "allowed": ${JSON.stringify(toolConfig.allowedTools || ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'LS'])}
  },
  "workflow": {
    "nodes": ${nodes.length},
    "edges": ${edges.length}
  }
}
SETTINGS

${selectedServers.length > 0 ? `
# MCP Server Configuration
cat > mcp_servers.json << 'MCP'
{
  "servers": [
${selectedServers.map(s => `    {
      "name": "${s.name}",
      "command": "${s.config.command}",
      "description": "${s.description}"
    }`).join(',\n')}
  ]
}
MCP
` : ''}

echo "Setup complete!"
echo "CLAUDE.md and configuration files created in .claude/"
`;
  };

  const script = generateSetupScript();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    if ('vibrate' in navigator) navigator.vibrate(5);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-setup.sh`;
    a.click();
    URL.revokeObjectURL(url);
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${projectName} - Setup Script`,
          text: 'Claude Agent Builder setup script',
          files: [new File([script], 'setup.sh', { type: 'text/plain' })],
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 animate-ios-fade-in" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-ios-2xl shadow-ios-sheet animate-ios-slide-up max-h-[85vh] flex flex-col md:inset-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-2xl md:mx-auto md:rounded-ios-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ios-separator flex-shrink-0">
          <button onClick={onClose} className="touch-target -ml-2">
            <X className="w-6 h-6 text-text-secondary" />
          </button>
          <h2 className="text-ios-headline font-semibold text-text-primary">Export Script</h2>
          <button onClick={handleShare} className="touch-target -mr-2">
            <Share className="w-6 h-6 text-ios-blue" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ios-separator flex-shrink-0">
          {[
            { id: 'setup', label: 'Setup Script' },
            { id: 'claudemd', label: 'CLAUDE.md' },
            { id: 'mcp', label: 'MCP Config' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-ios-subhead font-medium transition-colors
                ${activeTab === tab.id ? 'text-ios-blue border-b-2 border-ios-blue' : 'text-text-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'setup' && (
            <div className="bg-surface-elevated rounded-ios-lg p-4 overflow-x-auto">
              <pre className="text-ios-footnote text-text-primary font-mono whitespace-pre-wrap break-all">
                {script}
              </pre>
            </div>
          )}
          
          {activeTab === 'claudemd' && (
            <div className="bg-surface-elevated rounded-ios-lg p-4">
              <pre className="text-ios-footnote text-text-primary font-mono whitespace-pre-wrap">
                {claudeMd || '# No CLAUDE.md configured'}
              </pre>
            </div>
          )}
          
          {activeTab === 'mcp' && (
            <div className="space-y-3">
              {selectedMcpServers.length > 0 ? (
                mcpServers
                  .filter(s => selectedMcpServers.includes(s.id))
                  .map((server) => (
                    <div key={server.id} className="ios-card p-4">
                      <h3 className="text-ios-subhead font-semibold text-text-primary">{server.name}</h3>
                      <p className="text-ios-footnote text-text-secondary mt-1">{server.description}</p>
                      <code className="text-ios-caption1 text-ios-blue mt-2 block font-mono">{server.config.command}</code>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-ios-subhead text-text-secondary">No MCP servers configured</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-ios-separator pb-safe flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 ios-button-secondary"
          >
            {copied ? <Check className="w-5 h-5 mr-2 text-ios-green" /> : <Copy className="w-5 h-5 mr-2" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 ios-button-primary"
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </button>
        </div>
      </div>
    </>
  );
}

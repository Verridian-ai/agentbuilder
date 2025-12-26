import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Copy, Terminal as TerminalIcon, Check } from 'lucide-react';
import { useStore } from '../store';

export default function TerminalPanel() {
  const { terminalOpen, setTerminalOpen, terminalLogs, clearTerminalLogs, addTerminalLog } = useStore();
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(terminalLogs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    addTerminalLog(`$ ${cmd}`);
    if (cmd === 'help') addTerminalLog('Available commands: help, clear, status, version');
    else if (cmd === 'clear') clearTerminalLogs();
    else if (cmd === 'status') { addTerminalLog('Agent: Ready'); addTerminalLog('MCP Servers: 0 connected'); }
    else if (cmd === 'version') addTerminalLog('Claude Agent Builder v1.0.0');
    else addTerminalLog(`Command not recognized: ${cmd}`);
    setInput('');
  };

  if (!terminalOpen) {
    return (
      <button onClick={() => setTerminalOpen(true)}
        className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-text-secondary hover:text-text-primary shadow-node transition-all hover:shadow-elevated">
        <TerminalIcon className="w-4 h-4" /><span className="text-sm font-heading font-medium">Terminal</span><ChevronUp className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="h-[220px] bg-terminal border-t border-border-subtle flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-claude-orange" />
          <span className="text-sm font-heading font-medium text-text-primary">Terminal</span>
          <span className="text-xs text-text-tertiary px-2 py-0.5 bg-surface-elevated rounded">{terminalLogs.length} lines</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors text-xs">
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={clearTerminalLogs} className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors" title="Clear"><Trash2 className="w-4 h-4" /></button>
          <button onClick={() => setTerminalOpen(false)} className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors" title="Collapse"><ChevronDown className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {terminalLogs.length === 0 ? (
          <div className="text-text-tertiary"><p>Welcome to Claude Agent Builder Terminal</p><p className="mt-1">Type <span className="text-claude-orange">help</span> for available commands</p></div>
        ) : (
          terminalLogs.map((log, i) => (
            <div key={i} className={`whitespace-pre-wrap ${log.startsWith('$') ? 'text-claude-orange' : log.includes('Error') || log.includes('not recognized') ? 'text-danger' : log.includes('Ready') || log.includes('Success') ? 'text-success' : 'text-text-secondary'}`}>{log}</div>
          ))
        )}
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border-subtle bg-surface-elevated/50">
        <span className="text-claude-orange font-mono font-bold">$</span>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a command..."
          className="flex-1 bg-transparent text-text-primary font-mono text-sm outline-none placeholder-text-tertiary"
          onKeyDown={(e) => { if (e.key === 'Enter') handleCommand(input); }} />
      </div>
    </div>
  );
}

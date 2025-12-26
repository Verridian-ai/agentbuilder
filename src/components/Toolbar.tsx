import { useState } from 'react';
import { Play, Save, Download, Gauge, ChevronRight, Home } from 'lucide-react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { estimateTokens, getContextStatus } from '../lib/ai';

export default function Toolbar() {
  const { projectName, claudeMd, addTerminalLog, setTerminalOpen, setExportModalOpen } = useStore();
  const [running, setRunning] = useState(false);

  const contextTokens = estimateTokens(claudeMd);
  const contextStatus = getContextStatus(contextTokens);

  const statusColors: Record<string, string> = { low: 'text-success', medium: 'text-warning', high: 'text-danger' };
  const statusBg: Record<string, string> = { low: 'bg-success/10', medium: 'bg-warning/10', high: 'bg-danger/10' };

  const handleRun = () => {
    setRunning(true);
    setTerminalOpen(true);
    addTerminalLog(`[${new Date().toLocaleTimeString()}] Starting agent execution...`);
    setTimeout(() => addTerminalLog(`[${new Date().toLocaleTimeString()}] Loading configuration...`), 500);
    setTimeout(() => { addTerminalLog(`[${new Date().toLocaleTimeString()}] Agent ready. Context: ${contextTokens} tokens`); setRunning(false); }, 1500);
  };

  const handleSave = () => addTerminalLog(`[${new Date().toLocaleTimeString()}] Configuration saved.`);

  return (
    <div className="h-[56px] bg-surface border-b border-border-subtle flex items-center justify-between px-4">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors"><Home className="w-4 h-4" /></Link>
        <ChevronRight className="w-4 h-4 text-text-tertiary" />
        <span className="text-text-primary font-heading font-medium">{projectName}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${statusBg[contextStatus]} ${statusColors[contextStatus]}`}>
          <Gauge className="w-4 h-4" />
          <span className="text-sm font-medium font-mono">{contextTokens.toLocaleString()}</span>
          <span className="text-xs opacity-70">tokens</span>
        </div>
        <div className="h-6 w-px bg-border-subtle" />
        <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-md transition-colors">
          <Save className="w-4 h-4" /><span className="text-sm font-medium">Save</span>
        </button>
        <button onClick={() => setExportModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-claude-blue hover:text-claude-blue/80 hover:bg-claude-blue/10 rounded-md transition-colors">
          <Download className="w-4 h-4" /><span className="text-sm font-medium">Export</span>
        </button>
        <button onClick={handleRun} disabled={running}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${running ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success hover:bg-success/30'}`}>
          <Play className={`w-4 h-4 ${running ? 'animate-pulse' : ''}`} />
          <span>{running ? 'Running...' : 'Run'}</span>
        </button>
      </div>
    </div>
  );
}

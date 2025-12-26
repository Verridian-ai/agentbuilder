import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useStore, AgentNode, AgentEdge } from '../store';
import { defaultTemplates, agentPersonas, mcpServers } from '../lib/db';
import { useMobileNav, BottomSheet, ActionSheet } from '../components/MobileNavigation';
import ScriptExportModal from '../components/ScriptExportModal';
import { 
  ChevronLeft, MoreHorizontal, Play, Save, Download, Zap, User, Server, 
  Code, GitBranch, Plus, Trash2, Link as LinkIcon, Settings, FileCode, 
  Wrench, X, Layers, GripVertical
} from 'lucide-react';

export default function Builder() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('template');
  const { setShowTabBar } = useMobileNav();
  
  const { 
    projectName, setCurrentProject, setClaudeMd, claudeMd, setSelectedNodeId, selectedNodeId,
    nodes, setNodes, edges, setEdges, exportModalOpen, setExportModalOpen,
    addTerminalLog
  } = useStore();

  // Mobile-specific state
  const [activePanel, setActivePanel] = useState<'canvas' | 'palette' | 'config'>('canvas');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showPaletteSheet, setShowPaletteSheet] = useState(false);
  const [showConfigSheet, setShowConfigSheet] = useState(false);
  const [configTab, setConfigTab] = useState<'properties' | 'claudemd' | 'tools'>('properties');
  
  // Touch interaction state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Hide tab bar in builder
  useEffect(() => {
    setShowTabBar(false);
    return () => setShowTabBar(true);
  }, [setShowTabBar]);

  // Load template
  useEffect(() => {
    if (templateId) {
      const template = defaultTemplates.find((t) => t.id === templateId);
      if (template) {
        setCurrentProject(id || '', template.name);
        setClaudeMd(template.content.claudeMd);
        const loadedNodes: AgentNode[] = template.content.nodes.map((n: any) => ({
          id: n.id, type: n.type,
          position: { x: n.position?.x || 100, y: n.position?.y || 100 },
          data: { label: n.data?.label || 'Node', type: n.type, ...n.data },
        }));
        setNodes(loadedNodes);
        setEdges(template.content.edges.map((e: any) => ({ id: e.id, source: e.source, target: e.target, data: e.data })));
      }
    }
  }, [templateId, id, setCurrentProject, setClaudeMd, setNodes, setEdges]);

  // Touch handlers for canvas
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDistance(distance);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStart && !draggedNode) {
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;
      setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && initialPinchDistance) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / initialPinchDistance;
      setZoom(prev => Math.max(0.5, Math.min(2, prev * scale)));
      setInitialPinchDistance(distance);
    } else if (draggedNode && touchStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.touches[0].clientX - rect.left - panOffset.x) / zoom;
        const y = (e.touches[0].clientY - rect.top - panOffset.y) / zoom;
        setNodes(nodes.map(n => n.id === draggedNode ? { ...n, position: { x: x - 90, y: y - 35 } } : n));
      }
    }
  }, [touchStart, draggedNode, initialPinchDistance, zoom, panOffset, nodes, setNodes]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    setInitialPinchDistance(null);
    setDraggedNode(null);
    setIsDragging(false);
  }, []);

  // Node interaction handlers
  const handleNodeTap = (nodeId: string) => {
    if (connecting) {
      if (connecting !== nodeId) {
        setEdges([...edges, { id: `e-${connecting}-${nodeId}`, source: connecting, target: nodeId }]);
      }
      setConnecting(null);
    } else {
      setSelectedNodeId(nodeId);
      setShowConfigSheet(true);
      setConfigTab('properties');
    }
  };

  const handleNodeLongPress = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    // Haptic feedback simulation
    if ('vibrate' in navigator) navigator.vibrate(10);
    setDraggedNode(nodeId);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setEdges(edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    setShowConfigSheet(false);
  };

  const addNode = (type: string, label: string, meta?: Record<string, any>) => {
    const newNode: AgentNode = {
      id: `${type}-${Date.now()}`, type,
      position: { x: 150 - panOffset.x / zoom, y: 200 - panOffset.y / zoom },
      data: { label, type: type as any, ...meta },
    };
    setNodes([...nodes, newNode]);
    setShowPaletteSheet(false);
    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  const getNodeStyles = (type: string) => {
    switch (type) {
      case 'agent': return { border: 'border-ios-orange', bg: 'bg-ios-orange/10', icon: User, iconColor: 'text-ios-orange' };
      case 'mcp': return { border: 'border-ios-blue', bg: 'bg-ios-blue/10', icon: Server, iconColor: 'text-ios-blue' };
      case 'action': return { border: 'border-ios-green', bg: 'bg-ios-green/10', icon: Code, iconColor: 'text-ios-green' };
      case 'logic': return { border: 'border-ios-gray-1', bg: 'bg-ios-gray-1/10', icon: GitBranch, iconColor: 'text-ios-gray-1' };
      default: return { border: 'border-border-default', bg: 'bg-surface-elevated', icon: Zap, iconColor: 'text-text-secondary' };
    }
  };

  const handleRun = () => {
    addTerminalLog(`[${new Date().toLocaleTimeString()}] Starting agent execution...`);
    if ('vibrate' in navigator) navigator.vibrate([5, 50, 5]);
  };

  const handleSave = () => {
    addTerminalLog(`[${new Date().toLocaleTimeString()}] Configuration saved.`);
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      {/* iOS Navigation Bar */}
      <header className="ios-nav-bar border-b border-ios-separator">
        <div className="flex items-center justify-between h-[44px] px-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-ios-blue touch-target -ml-2"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-ios-body">Back</span>
          </button>
          <h1 className="text-ios-headline font-semibold text-text-primary truncate max-w-[40%]">
            {projectName || 'New Agent'}
          </h1>
          <button 
            onClick={() => setShowActionSheet(true)}
            className="touch-target -mr-2"
          >
            <MoreHorizontal className="w-6 h-6 text-ios-blue" />
          </button>
        </div>
      </header>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden canvas-grid touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { setSelectedNodeId(null); setConnecting(null); }}
      >
        {/* SVG Connections */}
        <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#007AFF" />
            </marker>
          </defs>
          <g style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})` }}>
            {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;
              const sx = sourceNode.position.x + 90;
              const sy = sourceNode.position.y + 35;
              const tx = targetNode.position.x + 90;
              const ty = targetNode.position.y + 35;
              return (
                <path 
                  key={edge.id}
                  d={`M ${sx} ${sy} C ${sx + 60} ${sy}, ${tx - 60} ${ty}, ${tx} ${ty}`}
                  fill="none" 
                  stroke="#007AFF" 
                  strokeWidth={2 / zoom}
                  markerEnd="url(#arrowhead-blue)"
                />
              );
            })}
          </g>
        </svg>

        {/* Nodes */}
        <div 
          className="absolute inset-0"
          style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
        >
          {nodes.map((node) => {
            const styles = getNodeStyles(node.type);
            const Icon = styles.icon;
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                className={`absolute select-none rounded-ios-lg border-2 min-w-[180px] shadow-ios-card transition-all
                  ${styles.border} ${styles.bg} ${isSelected ? 'ring-2 ring-ios-blue shadow-ios-lg scale-105' : ''}
                  ${draggedNode === node.id ? 'opacity-80 scale-110' : ''}`}
                style={{ left: node.position.x, top: node.position.y }}
                onClick={(e) => { e.stopPropagation(); handleNodeTap(node.id); }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  const timer = setTimeout(() => handleNodeLongPress(node.id), 300);
                  const clear = () => clearTimeout(timer);
                  e.currentTarget.addEventListener('touchend', clear, { once: true });
                  e.currentTarget.addEventListener('touchmove', clear, { once: true });
                }}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-ios-separator/30">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${styles.iconColor}`} />
                    <span className="text-ios-caption1 font-semibold uppercase text-text-secondary">{node.type}</span>
                  </div>
                  <GripVertical className="w-4 h-4 text-text-tertiary" />
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-ios-subhead font-semibold text-text-primary">{node.data.label}</p>
                </div>
                {/* Connection Points */}
                <div 
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-surface border-2 border-ios-blue rounded-full"
                  onClick={(e) => { e.stopPropagation(); if (connecting) handleNodeTap(node.id); }}
                />
                <div 
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-surface border-2 border-ios-blue rounded-full"
                  onClick={(e) => { e.stopPropagation(); setConnecting(node.id); }}
                />
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 mx-auto mb-4 rounded-ios-xl bg-surface-elevated flex items-center justify-center">
                <Zap className="w-8 h-8 text-ios-blue" />
              </div>
              <h3 className="text-ios-title3 font-semibold text-text-primary mb-2">Build Your Workflow</h3>
              <p className="text-ios-subhead text-text-secondary mb-6">Tap the + button to add agents and actions to your canvas.</p>
              <button 
                onClick={() => setShowPaletteSheet(true)}
                className="ios-button-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Component
              </button>
            </div>
          </div>
        )}

        {/* Connection Mode Indicator */}
        {connecting && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-ios-blue text-white rounded-ios-full text-ios-subhead font-medium shadow-ios-md">
            Tap another node to connect
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-surface-elevated border border-ios-separator rounded-ios-lg p-1 shadow-ios-sm">
          <button 
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} 
            className="w-10 h-10 flex items-center justify-center text-text-primary text-ios-title3 active:bg-surface-active rounded-ios-md"
          >
            -
          </button>
          <span className="text-ios-caption1 text-text-secondary min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={() => setZoom(Math.min(2, zoom + 0.1))} 
            className="w-10 h-10 flex items-center justify-center text-text-primary text-ios-title3 active:bg-surface-active rounded-ios-md"
          >
            +
          </button>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-surface border-t border-ios-separator pb-safe">
        <div className="flex items-center justify-around h-14 px-4">
          <button 
            onClick={() => setShowPaletteSheet(true)}
            className="flex flex-col items-center gap-1 text-ios-blue touch-target"
          >
            <Plus className="w-6 h-6" />
            <span className="text-ios-caption2">Add</span>
          </button>
          <button 
            onClick={() => { setShowConfigSheet(true); setConfigTab('claudemd'); }}
            className="flex flex-col items-center gap-1 text-text-secondary touch-target"
          >
            <FileCode className="w-6 h-6" />
            <span className="text-ios-caption2">Config</span>
          </button>
          <button 
            onClick={handleRun}
            className="w-14 h-14 -mt-4 bg-ios-green rounded-full flex items-center justify-center shadow-ios-lg active:scale-95 transition-transform"
          >
            <Play className="w-7 h-7 text-white ml-1" />
          </button>
          <button 
            onClick={handleSave}
            className="flex flex-col items-center gap-1 text-text-secondary touch-target"
          >
            <Save className="w-6 h-6" />
            <span className="text-ios-caption2">Save</span>
          </button>
          <button 
            onClick={() => setExportModalOpen(true)}
            className="flex flex-col items-center gap-1 text-text-secondary touch-target"
          >
            <Download className="w-6 h-6" />
            <span className="text-ios-caption2">Export</span>
          </button>
        </div>
      </div>

      {/* Component Palette Sheet */}
      <BottomSheet 
        isOpen={showPaletteSheet} 
        onClose={() => setShowPaletteSheet(false)}
        title="Add Component"
      >
        <div className="p-4 space-y-4">
          {/* Agent Personas */}
          <div>
            <h3 className="text-ios-footnote font-semibold text-text-secondary uppercase tracking-wider mb-2 px-1">Agent Personas</h3>
            <div className="grid grid-cols-2 gap-2">
              {agentPersonas.slice(0, 6).map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => addNode('agent', persona.name, { persona: persona.id })}
                  className="ios-card p-3 text-left active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 rounded-ios-md bg-ios-orange/20 flex items-center justify-center mb-2">
                    <User className="w-4 h-4 text-ios-orange" />
                  </div>
                  <p className="text-ios-subhead font-medium text-text-primary truncate">{persona.name}</p>
                </button>
              ))}
            </div>
          </div>
          
          {/* MCP Servers */}
          <div>
            <h3 className="text-ios-footnote font-semibold text-text-secondary uppercase tracking-wider mb-2 px-1">MCP Servers</h3>
            <div className="grid grid-cols-2 gap-2">
              {mcpServers.slice(0, 4).map((server) => (
                <button
                  key={server.id}
                  onClick={() => addNode('mcp', server.name, { serverId: server.id })}
                  className="ios-card p-3 text-left active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 rounded-ios-md bg-ios-blue/20 flex items-center justify-center mb-2">
                    <Server className="w-4 h-4 text-ios-blue" />
                  </div>
                  <p className="text-ios-subhead font-medium text-text-primary truncate">{server.name}</p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div>
            <h3 className="text-ios-footnote font-semibold text-text-secondary uppercase tracking-wider mb-2 px-1">Actions</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Read File', action: 'read' },
                { label: 'Write File', action: 'write' },
                { label: 'Run Bash', action: 'bash' },
                { label: 'Search', action: 'grep' },
                { label: 'Git', action: 'git' },
                { label: 'Condition', action: 'condition' },
              ].map((item) => (
                <button
                  key={item.action}
                  onClick={() => addNode('action', item.label, { action: item.action })}
                  className="ios-card p-3 text-center active:scale-95 transition-transform"
                >
                  <Code className="w-5 h-5 text-ios-green mx-auto mb-1" />
                  <p className="text-ios-caption1 text-text-primary">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Config Sheet */}
      <BottomSheet 
        isOpen={showConfigSheet} 
        onClose={() => setShowConfigSheet(false)}
        title={selectedNodeId ? nodes.find(n => n.id === selectedNodeId)?.data.label : 'Configuration'}
      >
        <div>
          {/* Tab Bar */}
          <div className="flex border-b border-ios-separator">
            {[
              { id: 'properties', label: 'Properties', icon: Settings },
              { id: 'claudemd', label: 'CLAUDE.md', icon: FileCode },
              { id: 'tools', label: 'Tools', icon: Wrench },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-ios-subhead transition-colors
                    ${configTab === tab.id ? 'text-ios-blue border-b-2 border-ios-blue' : 'text-text-secondary'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Tab Content */}
          <div className="p-4 max-h-[50vh] overflow-y-auto">
            {configTab === 'properties' && selectedNodeId && (
              <div className="space-y-4">
                <div className="ios-card p-4">
                  <p className="text-ios-headline font-semibold text-text-primary mb-1">
                    {nodes.find(n => n.id === selectedNodeId)?.data.label}
                  </p>
                  <p className="text-ios-footnote text-text-secondary uppercase">
                    {nodes.find(n => n.id === selectedNodeId)?.type}
                  </p>
                </div>
                <button
                  onClick={() => { setConnecting(selectedNodeId); setShowConfigSheet(false); }}
                  className="ios-button-secondary w-full"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Connect to Node
                </button>
                <button
                  onClick={() => deleteNode(selectedNodeId)}
                  className="ios-button w-full bg-ios-red/10 text-ios-red"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Node
                </button>
              </div>
            )}
            
            {configTab === 'claudemd' && (
              <div className="space-y-4">
                <textarea
                  value={claudeMd}
                  onChange={(e) => setClaudeMd(e.target.value)}
                  placeholder="Enter your CLAUDE.md configuration..."
                  className="w-full h-64 px-4 py-3 bg-surface-elevated border border-ios-separator rounded-ios-lg text-text-primary font-mono text-ios-footnote resize-none focus:border-ios-blue outline-none"
                  spellCheck={false}
                />
              </div>
            )}
            
            {configTab === 'tools' && (
              <div className="space-y-3">
                {['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'].map((tool) => (
                  <label key={tool} className="ios-list-item rounded-ios-lg">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-ios-sm accent-ios-blue mr-3" />
                    <span className="text-ios-body text-text-primary font-mono">{tool}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={projectName}
        actions={[
          { label: 'Export Script', onClick: () => setExportModalOpen(true) },
          { label: 'Share', onClick: () => {} },
          { label: 'Duplicate', onClick: () => {} },
          { label: 'Delete Project', onClick: () => navigate('/'), destructive: true },
        ]}
      />

      {/* Export Modal */}
      <ScriptExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </div>
  );
}

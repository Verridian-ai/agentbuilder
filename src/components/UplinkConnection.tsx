import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store';
import {
  Wifi, WifiOff, RefreshCw, Link2, Unlink, Activity,
  Globe, Database, Lock, Server, Zap, CheckCircle2,
  AlertCircle, Clock, TrendingUp, Signal
} from 'lucide-react';

interface UplinkConnectionProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConnectionMetrics {
  latency: number;
  packetsIn: number;
  packetsOut: number;
  bytesTransferred: number;
  uptime: number;
}

export default function UplinkConnection({ isOpen, onClose }: UplinkConnectionProps) {
  const { cloudIDE, setCloudIDE, claudeMaxConnection } = useStore();
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    packetsIn: 0,
    packetsOut: 0,
    bytesTransferred: 0,
    uptime: 0,
  });
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    time: string;
    event: string;
    status: 'success' | 'error' | 'info';
  }>>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const metricsIntervalRef = useRef<number | null>(null);

  // Simulate WebSocket connection
  const connectWebSocket = useCallback(async () => {
    setCloudIDE({ uplinkStatus: 'connecting' });
    
    addConnectionEvent('Initiating WebSocket handshake...', 'info');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));
    addConnectionEvent('TLS 1.3 negotiation complete', 'success');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    addConnectionEvent('Authentication verified', 'success');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Establish simulated connection
    setCloudIDE({
      uplinkStatus: 'online',
      wsConnection: true,
      connectionStatus: 'connected',
      lastSync: new Date().toISOString(),
    });
    
    addConnectionEvent('Uplink established successfully', 'success');
    
    // Start metrics simulation
    startMetricsSimulation();
  }, [setCloudIDE]);

  const disconnectWebSocket = useCallback(() => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }
    
    setCloudIDE({
      uplinkStatus: 'offline',
      wsConnection: false,
      connectionStatus: 'disconnected',
    });
    
    addConnectionEvent('Uplink disconnected', 'info');
    setMetrics({
      latency: 0,
      packetsIn: 0,
      packetsOut: 0,
      bytesTransferred: 0,
      uptime: 0,
    });
  }, [setCloudIDE]);

  const addConnectionEvent = (event: string, status: 'success' | 'error' | 'info') => {
    const time = new Date().toLocaleTimeString();
    setConnectionHistory(prev => [...prev.slice(-9), { time, event, status }]);
  };

  const startMetricsSimulation = () => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }
    
    metricsIntervalRef.current = window.setInterval(() => {
      setMetrics(prev => ({
        latency: 15 + Math.random() * 30,
        packetsIn: prev.packetsIn + Math.floor(Math.random() * 10),
        packetsOut: prev.packetsOut + Math.floor(Math.random() * 8),
        bytesTransferred: prev.bytesTransferred + Math.floor(Math.random() * 1024),
        uptime: prev.uptime + 1,
      }));
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-text-tertiary/40 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-4 pb-3 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary text-center">Uplink Connection</h2>
        </div>
        
        <div className="overflow-y-auto max-h-[70vh] p-4 space-y-4">
          {/* Connection Status Card */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            cloudIDE.uplinkStatus === 'online'
              ? 'bg-accent/10 border-accent/30'
              : cloudIDE.uplinkStatus === 'connecting'
              ? 'bg-secondary/10 border-secondary/30'
              : 'bg-surface-elevated border-border-subtle'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                cloudIDE.uplinkStatus === 'online' 
                  ? 'bg-accent/20' 
                  : cloudIDE.uplinkStatus === 'connecting'
                  ? 'bg-secondary/20'
                  : 'bg-muted'
              }`}>
                {cloudIDE.uplinkStatus === 'online' ? (
                  <Wifi className="w-7 h-7 text-accent" />
                ) : cloudIDE.uplinkStatus === 'connecting' ? (
                  <RefreshCw className="w-7 h-7 text-secondary animate-spin" />
                ) : (
                  <WifiOff className="w-7 h-7 text-text-tertiary" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-semibold text-text-primary text-lg">
                  {cloudIDE.uplinkStatus === 'online' ? 'Connected' :
                   cloudIDE.uplinkStatus === 'connecting' ? 'Establishing Connection...' :
                   cloudIDE.uplinkStatus === 'syncing' ? 'Syncing Data...' : 'Disconnected'}
                </p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {cloudIDE.uplinkStatus === 'online' 
                    ? `WebSocket active | ${metrics.latency.toFixed(0)}ms latency`
                    : 'Click connect to establish uplink'}
                </p>
              </div>
              
              {cloudIDE.uplinkStatus === 'online' && (
                <div className="flex items-center gap-1">
                  <Signal className="w-4 h-4 text-accent animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Real-time Metrics */}
          {cloudIDE.uplinkStatus === 'online' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-elevated rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-accent" />
                  <span className="text-xs text-text-secondary">Latency</span>
                </div>
                <p className="text-xl font-semibold text-text-primary">{metrics.latency.toFixed(0)}ms</p>
              </div>
              
              <div className="bg-surface-elevated rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-text-secondary">Uptime</span>
                </div>
                <p className="text-xl font-semibold text-text-primary">{formatUptime(metrics.uptime)}</p>
              </div>
              
              <div className="bg-surface-elevated rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-xs text-text-secondary">Transferred</span>
                </div>
                <p className="text-xl font-semibold text-text-primary">{formatBytes(metrics.bytesTransferred)}</p>
              </div>
              
              <div className="bg-surface-elevated rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-warning" />
                  <span className="text-xs text-text-secondary">Packets</span>
                </div>
                <p className="text-xl font-semibold text-text-primary">{metrics.packetsIn + metrics.packetsOut}</p>
              </div>
            </div>
          )}

          {/* Connection Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-text-secondary px-1">Connection Details</h3>
            
            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-primary">Browser Session</span>
              </div>
              <div className="flex items-center gap-2">
                {claudeMaxConnection.status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-text-tertiary" />
                )}
                <span className={`text-xs font-medium ${claudeMaxConnection.status === 'connected' ? 'text-accent' : 'text-text-tertiary'}`}>
                  {claudeMaxConnection.status === 'connected' ? 'Linked' : 'Not linked'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-primary">Cloud Instance</span>
              </div>
              <span className={`text-xs font-medium ${cloudIDE.activeInstanceId ? 'text-accent' : 'text-text-tertiary'}`}>
                {cloudIDE.activeInstanceId ? 'Active' : 'None'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-primary">Cloud Storage</span>
              </div>
              <span className="text-xs font-medium text-accent">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-primary">Encryption</span>
              </div>
              <span className="text-xs font-medium text-accent">TLS 1.3</span>
            </div>
          </div>

          {/* Connection Log */}
          {connectionHistory.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text-secondary px-1">Connection Log</h3>
              <div className="bg-surface-elevated rounded-xl p-3 max-h-40 overflow-y-auto">
                {connectionHistory.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5 text-xs">
                    <span className="text-text-tertiary font-mono">{entry.time}</span>
                    <span className={
                      entry.status === 'success' ? 'text-accent' :
                      entry.status === 'error' ? 'text-destructive' : 'text-text-secondary'
                    }>{entry.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {cloudIDE.uplinkStatus !== 'online' ? (
            <button
              onClick={connectWebSocket}
              disabled={cloudIDE.uplinkStatus === 'connecting'}
              className="w-full p-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              {cloudIDE.uplinkStatus === 'connecting' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5" />
                  Connect Uplink
                </>
              )}
            </button>
          ) : (
            <button
              onClick={disconnectWebSocket}
              className="w-full p-4 bg-surface-elevated hover:bg-surface-active text-destructive rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Unlink className="w-5 h-5" />
              Disconnect
            </button>
          )}

          {cloudIDE.lastSync && (
            <p className="text-xs text-text-tertiary text-center">
              Last sync: {new Date(cloudIDE.lastSync).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

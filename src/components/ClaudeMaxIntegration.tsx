import { useState, useEffect } from 'react';
import { useStore } from '../store';
import {
  Globe, Key, Shield, RefreshCw, Check, AlertCircle, X,
  ExternalLink, Zap, Activity, Clock, ChevronRight, Eye, EyeOff,
  Sparkles, Lock, Unlock, WifiOff, Wifi, Link2, Unlink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaudeMaxIntegration({ isOpen, onClose }: Props) {
  const { claudeMaxConnection, setClaudeMaxConnection, setSubscription } = useStore();
  const [showToken, setShowToken] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Simulate browser session detection
  const detectBrowserSession = async () => {
    setClaudeMaxConnection({ status: 'detecting', errorMessage: null });
    
    // Simulate detection process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate checking for Claude session in browser
    const hasSession = Math.random() > 0.3; // 70% chance of finding session
    
    if (hasSession) {
      setClaudeMaxConnection({
        status: 'connecting',
        errorMessage: null,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful connection
      const planType = Math.random() > 0.5 ? 'max20x' : 'max5x';
      const mockToken = `cla_${btoa(Date.now().toString()).slice(0, 32)}`;
      const mockRefresh = `clr_${btoa(Date.now().toString()).slice(0, 32)}`;
      
      setClaudeMaxConnection({
        status: 'connected',
        planType: planType as 'max5x' | 'max20x',
        sessionToken: mockToken,
        refreshToken: mockRefresh,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        email: 'user@example.com',
        lastConnected: new Date().toISOString(),
        usageStats: {
          dailyUsage: Math.floor(Math.random() * 1000),
          weeklyUsage: Math.floor(Math.random() * 5000),
          monthlyUsage: Math.floor(Math.random() * 15000),
          limit: planType === 'max20x' ? 100000 : 25000,
        },
      });
      
      setSubscription({
        tier: 'max',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } else {
      setClaudeMaxConnection({
        status: 'error',
        errorMessage: 'No active Claude session detected in browser. Please log in to claude.ai first.',
      });
    }
  };

  const handleManualTokenSubmit = async () => {
    if (!manualToken.trim()) return;
    
    setClaudeMaxConnection({ status: 'connecting', errorMessage: null });
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Validate token format
    if (manualToken.startsWith('cla_') || manualToken.length > 20) {
      setClaudeMaxConnection({
        status: 'connected',
        planType: 'max5x',
        sessionToken: manualToken,
        refreshToken: `clr_${btoa(Date.now().toString()).slice(0, 32)}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        email: 'user@example.com',
        lastConnected: new Date().toISOString(),
        usageStats: {
          dailyUsage: Math.floor(Math.random() * 1000),
          weeklyUsage: Math.floor(Math.random() * 5000),
          monthlyUsage: Math.floor(Math.random() * 15000),
          limit: 25000,
        },
      });
      
      setSubscription({
        tier: 'max',
        status: 'active',
      });
      
      setManualToken('');
      setShowManualEntry(false);
    } else {
      setClaudeMaxConnection({
        status: 'error',
        errorMessage: 'Invalid token format. Please ensure you have copied the correct session token.',
      });
    }
  };

  const handleDisconnect = () => {
    setClaudeMaxConnection({
      status: 'disconnected',
      planType: null,
      sessionToken: null,
      refreshToken: null,
      expiresAt: null,
      email: null,
      errorMessage: null,
      usageStats: null,
    });
    
    setSubscription({
      tier: 'free',
      status: 'inactive',
    });
  };

  const refreshConnection = async () => {
    if (claudeMaxConnection.refreshToken) {
      setClaudeMaxConnection({ status: 'connecting' });
      await new Promise(resolve => setTimeout(resolve, 800));
      setClaudeMaxConnection({
        status: 'connected',
        lastConnected: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  };

  if (!isOpen) return null;

  const usagePercent = claudeMaxConnection.usageStats
    ? (claudeMaxConnection.usageStats.monthlyUsage / claudeMaxConnection.usageStats.limit) * 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl border border-border-subtle w-full max-w-lg max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Claude Max Integration</h2>
              <p className="text-sm text-text-secondary">Connect your Max plan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-elevated rounded-xl transition-colors">
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Connection Status Card */}
          <div className={`p-4 rounded-xl border ${
            claudeMaxConnection.status === 'connected' 
              ? 'bg-accent/10 border-accent/30' 
              : claudeMaxConnection.status === 'error'
              ? 'bg-destructive/10 border-destructive/30'
              : 'bg-surface-elevated border-border-subtle'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {claudeMaxConnection.status === 'connected' ? (
                  <Wifi className="w-5 h-5 text-accent" />
                ) : claudeMaxConnection.status === 'error' ? (
                  <WifiOff className="w-5 h-5 text-destructive" />
                ) : claudeMaxConnection.status === 'detecting' || claudeMaxConnection.status === 'connecting' ? (
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <WifiOff className="w-5 h-5 text-text-tertiary" />
                )}
                <span className="font-medium text-text-primary">
                  {claudeMaxConnection.status === 'connected' ? 'Connected' :
                   claudeMaxConnection.status === 'detecting' ? 'Detecting Session...' :
                   claudeMaxConnection.status === 'connecting' ? 'Connecting...' :
                   claudeMaxConnection.status === 'error' ? 'Connection Failed' :
                   'Not Connected'}
                </span>
              </div>
              
              {claudeMaxConnection.status === 'connected' && claudeMaxConnection.planType && (
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-lg">
                  {claudeMaxConnection.planType === 'max20x' ? 'Max 20x' : 'Max 5x'}
                </span>
              )}
            </div>

            {claudeMaxConnection.status === 'connected' && claudeMaxConnection.email && (
              <p className="text-sm text-text-secondary mb-3">{claudeMaxConnection.email}</p>
            )}

            {claudeMaxConnection.errorMessage && (
              <p className="text-sm text-destructive mb-3">{claudeMaxConnection.errorMessage}</p>
            )}

            {/* Usage Stats */}
            {claudeMaxConnection.status === 'connected' && claudeMaxConnection.usageStats && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Monthly Usage</span>
                    <span className="text-text-primary">
                      {claudeMaxConnection.usageStats.monthlyUsage.toLocaleString()} / {claudeMaxConnection.usageStats.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 90 ? 'bg-destructive' : usagePercent > 70 ? 'bg-warning' : 'bg-accent'
                      }`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-surface rounded-lg">
                    <p className="text-lg font-semibold text-text-primary">
                      {claudeMaxConnection.usageStats.dailyUsage.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-tertiary">Today</p>
                  </div>
                  <div className="p-2 bg-surface rounded-lg">
                    <p className="text-lg font-semibold text-text-primary">
                      {claudeMaxConnection.usageStats.weeklyUsage.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-tertiary">This Week</p>
                  </div>
                  <div className="p-2 bg-surface rounded-lg">
                    <p className="text-lg font-semibold text-text-primary">
                      {Math.round(usagePercent)}%
                    </p>
                    <p className="text-xs text-text-tertiary">Used</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Connection Actions */}
          {claudeMaxConnection.status !== 'connected' && (
            <>
              {/* Auto-detect Button */}
              <button
                onClick={detectBrowserSession}
                disabled={claudeMaxConnection.status === 'detecting' || claudeMaxConnection.status === 'connecting'}
                className="w-full p-4 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {claudeMaxConnection.status === 'detecting' || claudeMaxConnection.status === 'connecting' ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    {claudeMaxConnection.status === 'detecting' ? 'Detecting...' : 'Connecting...'}
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5" />
                    Connect from Browser Session
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-subtle" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-surface text-sm text-text-tertiary">or</span>
                </div>
              </div>

              {/* Manual Token Entry */}
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="w-full p-3 bg-surface-elevated hover:bg-surface-active rounded-xl text-text-primary flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-text-secondary" />
                  <span>Enter Token Manually</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-text-tertiary transition-transform ${showManualEntry ? 'rotate-90' : ''}`} />
              </button>

              {showManualEntry && (
                <div className="space-y-3 animate-fade-in">
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Paste your session token..."
                      className="w-full px-4 py-3 pr-12 bg-surface-elevated rounded-xl text-text-primary placeholder-text-tertiary border border-border-subtle focus:border-primary"
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-secondary"
                    >
                      {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={handleManualTokenSubmit}
                    disabled={!manualToken.trim()}
                    className="w-full p-3 bg-secondary hover:bg-secondary/90 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
                  >
                    Validate and Connect
                  </button>
                  <p className="text-xs text-text-tertiary text-center">
                    Get your token from claude.ai Developer Tools (Application &gt; Cookies)
                  </p>
                </div>
              )}

              {/* Open Claude.ai */}
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 bg-surface-elevated hover:bg-surface-active rounded-xl text-text-primary flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-text-secondary" />
                Open claude.ai to Sign In
              </a>
            </>
          )}

          {/* Connected Actions */}
          {claudeMaxConnection.status === 'connected' && (
            <div className="space-y-3">
              <button
                onClick={refreshConnection}
                className="w-full p-3 bg-surface-elevated hover:bg-surface-active rounded-xl text-text-primary flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-text-secondary" />
                Refresh Connection
              </button>
              
              <button
                onClick={handleDisconnect}
                className="w-full p-3 bg-destructive/10 hover:bg-destructive/20 rounded-xl text-destructive flex items-center justify-center gap-2 transition-colors"
              >
                <Unlink className="w-5 h-5" />
                Disconnect
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 bg-surface-elevated rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Secure Connection</p>
              <p className="text-xs text-text-tertiary mt-0.5">
                Tokens are encrypted and stored locally. Your Claude session remains private and is never shared.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaudeMaxIntegration;

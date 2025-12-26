import { useState, useEffect } from 'react';
import { ChevronRight, User, Bell, Moon, Shield, HelpCircle, Info, ExternalLink, LogOut, Key, Sparkles, Eye, EyeOff, Check, AlertCircle, RefreshCw, Activity, Zap, Server, Copy, Wifi, WifiOff, Terminal, Download, Crown } from 'lucide-react';
import { useStore } from '../store';
import { BottomSheet } from '../components/MobileNavigation';
import ClaudeMaxIntegration from '../components/ClaudeMaxIntegration';
import ClaudeCodeCLIInstaller from '../components/ClaudeCodeCLIInstaller';

export default function SettingsPage() {
  const { 
    user, setUser, subscription, 
    openRouterApiKey, setOpenRouterApiKey, 
    claudeCodeApiKey, setClaudeCodeApiKey,
    claudeMaxConnection, claudeCodeCLI
  } = useStore();
  
  const [showApiSheet, setShowApiSheet] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [tempOpenRouterKey, setTempOpenRouterKey] = useState(openRouterApiKey || '');
  const [tempClaudeKey, setTempClaudeKey] = useState(claudeCodeApiKey || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showMaxIntegration, setShowMaxIntegration] = useState(false);
  const [showCLIInstaller, setShowCLIInstaller] = useState(false);
  
  // API Validation States
  const [openRouterStatus, setOpenRouterStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [claudeStatus, setClaudeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [apiUsage, setApiUsage] = useState({
    openRouter: { requests: 0, tokens: 0, cost: 0 },
    claude: { requests: 0, tokens: 0, cost: 0 },
  });
  
  // Validate API keys on mount
  useEffect(() => {
    if (openRouterApiKey) {
      validateOpenRouterKey(openRouterApiKey);
    }
    if (claudeCodeApiKey) {
      validateClaudeKey(claudeCodeApiKey);
    }
  }, []);
  
  const validateOpenRouterKey = async (key: string) => {
    if (!key) {
      setOpenRouterStatus('idle');
      return;
    }
    
    setOpenRouterStatus('checking');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (key.startsWith('sk-or-v1-')) {
      setOpenRouterStatus('valid');
      setApiUsage(prev => ({
        ...prev,
        openRouter: { requests: 147, tokens: 52840, cost: 0.42 }
      }));
    } else {
      setOpenRouterStatus('invalid');
    }
  };
  
  const validateClaudeKey = async (key: string) => {
    if (!key) {
      setClaudeStatus('idle');
      return;
    }
    
    setClaudeStatus('checking');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    if (key.startsWith('sk-ant-')) {
      setClaudeStatus('valid');
      setApiUsage(prev => ({
        ...prev,
        claude: { requests: 89, tokens: 34560, cost: 0.28 }
      }));
    } else {
      setClaudeStatus('invalid');
    }
  };

  const handleSaveKeys = async () => {
    setOpenRouterApiKey(tempOpenRouterKey || null);
    setClaudeCodeApiKey(tempClaudeKey || null);
    
    if (tempOpenRouterKey) {
      await validateOpenRouterKey(tempOpenRouterKey);
    }
    if (tempClaudeKey) {
      await validateClaudeKey(tempClaudeKey);
    }
    
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowApiSheet(false);
    }, 1500);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-accent bg-accent/20';
      case 'invalid': return 'text-destructive bg-destructive/20';
      case 'checking': return 'text-secondary bg-secondary/20';
      default: return 'text-text-tertiary bg-muted';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return Check;
      case 'invalid': return AlertCircle;
      case 'checking': return RefreshCw;
      default: return Key;
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', value: user?.email || 'Not signed in', action: () => {} },
      ],
    },
    {
      title: 'Claude Max Plan',
      items: [
        { 
          icon: Crown, 
          label: 'Max Plan Connection', 
          value: claudeMaxConnection.status === 'connected' 
            ? `Connected (${claudeMaxConnection.planType === 'max20x' ? 'Max 20x' : 'Max 5x'})`
            : 'Not connected',
          status: claudeMaxConnection.status === 'connected' ? 'valid' : 
                  claudeMaxConnection.status === 'error' ? 'invalid' : 'idle',
          action: () => setShowMaxIntegration(true)
        },
        { 
          icon: Terminal, 
          label: 'Claude Code CLI', 
          value: claudeCodeCLI.installed 
            ? `v${claudeCodeCLI.version}`
            : 'Not installed',
          status: claudeCodeCLI.installed ? 'valid' : 'idle',
          action: () => setShowCLIInstaller(true)
        },
      ],
    },
    {
      title: 'API & Subscription',
      items: [
        { 
          icon: Key, 
          label: 'API Keys', 
          value: (openRouterApiKey || claudeCodeApiKey) ? 'Configured' : 'Not set',
          status: openRouterStatus === 'valid' || claudeStatus === 'valid' ? 'valid' : 
                  openRouterStatus === 'invalid' || claudeStatus === 'invalid' ? 'invalid' : 'idle',
          action: () => {
            setTempOpenRouterKey(openRouterApiKey || '');
            setTempClaudeKey(claudeCodeApiKey || '');
            setShowApiSheet(true);
          }
        },
        { 
          icon: Sparkles, 
          label: 'Subscription', 
          value: subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1),
          action: () => {} 
        },
        {
          icon: Activity,
          label: 'API Usage',
          value: `${(apiUsage.openRouter.tokens + apiUsage.claude.tokens).toLocaleString()} tokens`,
          action: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: 'On', action: () => {} },
        { icon: Moon, label: 'Appearance', value: 'Claude Dark', action: () => {} },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: Shield, label: 'Privacy', action: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: () => {} },
        { icon: Info, label: 'About', value: 'v1.0.0', action: () => {} },
        { icon: ExternalLink, label: 'Anthropic Docs', action: () => window.open('https://docs.anthropic.com', '_blank') },
        { icon: Server, label: 'Claude Code Docs', action: () => window.open('https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview', '_blank') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-canvas pb-tab-bar">
      <header className="pt-safe bg-canvas sticky top-0 z-30 border-b border-border-subtle">
        <div className="px-4 py-3">
          <h1 className="text-ios-large-title font-bold text-text-primary">Settings</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* User Card */}
        {user && (
          <div className="claude-card p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-ios-headline font-semibold text-text-primary">{user.email}</p>
                <p className="text-ios-footnote text-text-secondary">
                  {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Claude Max Connection Status Card */}
        {claudeMaxConnection.status === 'connected' && (
          <div className="claude-card p-4 border-accent/30 bg-accent/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-accent" />
                <span className="font-medium text-text-primary">Claude Max Connected</span>
              </div>
              <span className="px-2 py-1 rounded-ios-full text-xs font-medium bg-accent/20 text-accent">
                {claudeMaxConnection.planType === 'max20x' ? 'Max 20x' : 'Max 5x'}
              </span>
            </div>
            
            {claudeMaxConnection.usageStats && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Monthly Usage</span>
                  <span className="text-text-primary">
                    {claudeMaxConnection.usageStats.monthlyUsage.toLocaleString()} / {claudeMaxConnection.usageStats.limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${(claudeMaxConnection.usageStats.monthlyUsage / claudeMaxConnection.usageStats.limit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* API Status Cards */}
        {(openRouterApiKey || claudeCodeApiKey) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openRouterApiKey && (
              <div className="claude-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-medium text-text-primary">OpenRouter</span>
                  </div>
                  <span className={`px-2 py-1 rounded-ios-full text-xs font-medium ${getStatusColor(openRouterStatus)}`}>
                    {openRouterStatus === 'checking' && <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />}
                    {openRouterStatus === 'valid' ? 'Connected' : 
                     openRouterStatus === 'invalid' ? 'Invalid' : 
                     openRouterStatus === 'checking' ? 'Checking...' : 'Not Set'}
                  </span>
                </div>
                {openRouterStatus === 'valid' && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-text-primary">{apiUsage.openRouter.requests}</p>
                      <p className="text-xs text-text-tertiary">Requests</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-text-primary">{(apiUsage.openRouter.tokens / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-text-tertiary">Tokens</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-text-primary">${apiUsage.openRouter.cost.toFixed(2)}</p>
                      <p className="text-xs text-text-tertiary">Cost</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {claudeCodeApiKey && (
              <div className="claude-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    <span className="font-medium text-text-primary">Claude API</span>
                  </div>
                  <span className={`px-2 py-1 rounded-ios-full text-xs font-medium ${getStatusColor(claudeStatus)}`}>
                    {claudeStatus === 'checking' && <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />}
                    {claudeStatus === 'valid' ? 'Connected' : 
                     claudeStatus === 'invalid' ? 'Invalid' : 
                     claudeStatus === 'checking' ? 'Checking...' : 'Not Set'}
                  </span>
                </div>
                {claudeStatus === 'valid' && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-text-primary">{apiUsage.claude.requests}</p>
                      <p className="text-xs text-text-tertiary">Requests</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-text-primary">{(apiUsage.claude.tokens / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-text-tertiary">Tokens</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-text-primary">${apiUsage.claude.cost.toFixed(2)}</p>
                      <p className="text-xs text-text-tertiary">Cost</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-ios-footnote font-semibold text-text-secondary uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="claude-card overflow-hidden">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const StatusIcon = item.status ? getStatusIcon(item.status) : null;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`ios-list-item w-full ${index > 0 ? 'border-t border-border-subtle' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-claude flex items-center justify-center mr-3 ${
                      item.icon === Crown ? 'bg-gradient-to-br from-primary/20 to-secondary/20' : 'bg-primary/20'
                    }`}>
                      <Icon className={`w-4 h-4 ${item.icon === Crown ? 'text-primary' : 'text-primary'}`} />
                    </div>
                    <span className="flex-1 text-left text-ios-body text-text-primary">{item.label}</span>
                    {item.status && StatusIcon && (
                      <StatusIcon className={`w-4 h-4 mr-2 ${
                        item.status === 'valid' ? 'text-accent' :
                        item.status === 'invalid' ? 'text-destructive' :
                        'text-text-tertiary'
                      } ${item.status === 'checking' ? 'animate-spin' : ''}`} />
                    )}
                    {item.value && (
                      <span className="text-ios-subhead text-text-secondary mr-2">{item.value}</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-text-tertiary" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        {user && (
          <button
            onClick={() => setUser(null)}
            className="w-full claude-card p-4 flex items-center justify-center gap-2 text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-ios-body font-medium">Sign Out</span>
          </button>
        )}

        {/* Sign In */}
        {!user && (
          <button
            onClick={() => setUser({ id: crypto.randomUUID(), email: 'demo@example.com' })}
            className="w-full claude-button-primary"
          >
            Sign In
          </button>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-ios-caption1 text-text-tertiary">Claude Agent Builder</p>
          <p className="text-ios-caption2 text-text-tertiary">Powered by Anthropic</p>
        </div>
      </main>

      {/* API Keys Sheet */}
      <BottomSheet isOpen={showApiSheet} onClose={() => setShowApiSheet(false)} title="API Configuration">
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* OpenRouter API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-ios-footnote font-medium text-text-secondary">
                OpenRouter API Key
              </label>
              {openRouterStatus !== 'idle' && (
                <span className={`px-2 py-0.5 rounded-ios-full text-xs font-medium flex items-center gap-1 ${getStatusColor(openRouterStatus)}`}>
                  {openRouterStatus === 'checking' && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {openRouterStatus === 'valid' && <Check className="w-3 h-3" />}
                  {openRouterStatus === 'invalid' && <AlertCircle className="w-3 h-3" />}
                  {openRouterStatus === 'valid' ? 'Valid' : 
                   openRouterStatus === 'invalid' ? 'Invalid' : 'Checking...'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showOpenRouterKey ? 'text' : 'password'}
                value={tempOpenRouterKey}
                onChange={(e) => setTempOpenRouterKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="claude-input pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {tempOpenRouterKey && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tempOpenRouterKey)}
                    className="p-2 text-text-tertiary hover:text-text-secondary"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                  className="p-2 text-text-tertiary hover:text-text-secondary"
                >
                  {showOpenRouterKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <p className="text-ios-caption2 text-text-tertiary mt-1.5">
              Powers Perplexity research. Get your key at{' '}
              <a href="https://openrouter.ai" target="_blank" className="text-primary hover:underline">openrouter.ai</a>
            </p>
          </div>

          {/* Claude Code API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-ios-footnote font-medium text-text-secondary">
                Anthropic API Key
              </label>
              {claudeStatus !== 'idle' && (
                <span className={`px-2 py-0.5 rounded-ios-full text-xs font-medium flex items-center gap-1 ${getStatusColor(claudeStatus)}`}>
                  {claudeStatus === 'checking' && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {claudeStatus === 'valid' && <Check className="w-3 h-3" />}
                  {claudeStatus === 'invalid' && <AlertCircle className="w-3 h-3" />}
                  {claudeStatus === 'valid' ? 'Valid' : 
                   claudeStatus === 'invalid' ? 'Invalid' : 'Checking...'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showClaudeKey ? 'text' : 'password'}
                value={tempClaudeKey}
                onChange={(e) => setTempClaudeKey(e.target.value)}
                placeholder="sk-ant-..."
                className="claude-input pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {tempClaudeKey && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tempClaudeKey)}
                    className="p-2 text-text-tertiary hover:text-text-secondary"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowClaudeKey(!showClaudeKey)}
                  className="p-2 text-text-tertiary hover:text-text-secondary"
                >
                  {showClaudeKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <p className="text-ios-caption2 text-text-tertiary mt-1.5">
              Enables Claude Code features. Get your key at{' '}
              <a href="https://console.anthropic.com" target="_blank" className="text-primary hover:underline">console.anthropic.com</a>
            </p>
          </div>
          
          {/* Max Plan Notice */}
          {claudeMaxConnection.status === 'connected' && (
            <div className="p-3 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-3">
              <Wifi className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Max Plan Connected</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Your Claude Code CLI will use your Max plan subscription. API key is optional for additional API access.
                </p>
              </div>
            </div>
          )}
          
          {/* Rate Limits Info */}
          <div className="claude-card p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">API Rate Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Requests per minute</span>
                <span className="text-text-primary">60</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tokens per minute</span>
                <span className="text-text-primary">100,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Daily limit</span>
                <span className="text-text-primary">Unlimited</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveKeys}
            disabled={openRouterStatus === 'checking' || claudeStatus === 'checking'}
            className={`w-full claude-button-primary flex items-center justify-center gap-2 
              ${saveSuccess ? 'bg-accent' : ''} 
              ${(openRouterStatus === 'checking' || claudeStatus === 'checking') ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Saved Successfully
              </>
            ) : (openRouterStatus === 'checking' || claudeStatus === 'checking') ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Validating...
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </BottomSheet>
      
      {/* Claude Max Integration Modal */}
      <ClaudeMaxIntegration isOpen={showMaxIntegration} onClose={() => setShowMaxIntegration(false)} />
      
      {/* Claude Code CLI Installer Modal */}
      <ClaudeCodeCLIInstaller isOpen={showCLIInstaller} onClose={() => setShowCLIInstaller(false)} />
    </div>
  );
}

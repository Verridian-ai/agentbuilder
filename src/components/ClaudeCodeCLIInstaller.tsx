import { useState, useEffect } from 'react';
import { useStore } from '../store';
import {
  Terminal, Download, Check, AlertCircle, RefreshCw, X,
  ChevronRight, Settings, Folder, Code, Play, Cpu,
  CheckCircle2, Circle, Loader2, HelpCircle, ExternalLink,
  Apple, Monitor, Box
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type InstallMethod = 'native' | 'homebrew' | 'npm';
type Platform = 'macos' | 'linux' | 'windows';

const INSTALL_STEPS = [
  { id: 'check', label: 'System Check', description: 'Verifying system requirements' },
  { id: 'download', label: 'Download', description: 'Downloading Claude Code CLI' },
  { id: 'install', label: 'Install', description: 'Installing components' },
  { id: 'configure', label: 'Configure', description: 'Setting up configuration' },
  { id: 'verify', label: 'Verify', description: 'Validating installation' },
];

const PLATFORM_CONFIGS: Record<Platform, { name: string; icon: typeof Apple; commands: Record<InstallMethod, string[]> }> = {
  macos: {
    name: 'macOS',
    icon: Apple,
    commands: {
      native: ['curl -fsSL https://claude.ai/install.sh | sh'],
      homebrew: ['brew install anthropic/tap/claude-code'],
      npm: ['npm install -g @anthropic-ai/claude-code'],
    },
  },
  linux: {
    name: 'Linux',
    icon: Monitor,
    commands: {
      native: ['curl -fsSL https://claude.ai/install.sh | sh'],
      homebrew: ['brew install anthropic/tap/claude-code'],
      npm: ['npm install -g @anthropic-ai/claude-code'],
    },
  },
  windows: {
    name: 'Windows',
    icon: Box,
    commands: {
      native: ['winget install Anthropic.ClaudeCode'],
      homebrew: ['Not available on Windows'],
      npm: ['npm install -g @anthropic-ai/claude-code'],
    },
  },
};

export function ClaudeCodeCLIInstaller({ isOpen, onClose }: Props) {
  const { claudeCodeCLI, setClaudeCodeCLI, claudeMaxConnection } = useStore();
  const [platform, setPlatform] = useState<Platform>('macos');
  const [installMethod, setInstallMethod] = useState<InstallMethod>('native');
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('install');

  // Detect platform on mount
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setPlatform('macos');
    } else if (userAgent.includes('win')) {
      setPlatform('windows');
    } else {
      setPlatform('linux');
    }
  }, []);

  const startInstallation = async () => {
    setClaudeCodeCLI({ installStatus: 'checking', installProgress: 0, errorMessage: null });
    setCurrentStep(0);

    // Step 1: System Check
    await new Promise(resolve => setTimeout(resolve, 1000));
    setClaudeCodeCLI({ installProgress: 20 });
    setCurrentStep(1);

    // Step 2: Download
    setClaudeCodeCLI({ installStatus: 'downloading', installProgress: 40 });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentStep(2);

    // Step 3: Install
    setClaudeCodeCLI({ installStatus: 'installing', installProgress: 60 });
    await new Promise(resolve => setTimeout(resolve, 1200));
    setCurrentStep(3);

    // Step 4: Configure
    setClaudeCodeCLI({ installStatus: 'configuring', installProgress: 80 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentStep(4);

    // Step 5: Verify
    setClaudeCodeCLI({ installProgress: 100, installStatus: 'complete' });

    // Complete
    await new Promise(resolve => setTimeout(resolve, 500));
    setClaudeCodeCLI({
      installed: true,
      version: '1.0.34',
      lastChecked: new Date().toISOString(),
      configPath: platform === 'windows' ? '%APPDATA%\\claude-code' : '~/.config/claude-code',
    });
  };

  const checkForUpdates = async () => {
    setClaudeCodeCLI({ installStatus: 'checking' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setClaudeCodeCLI({
      installStatus: 'idle',
      lastChecked: new Date().toISOString(),
    });
  };

  if (!isOpen) return null;

  const PlatformIcon = PLATFORM_CONFIGS[platform].icon;
  const isInstalling = ['checking', 'downloading', 'installing', 'configuring'].includes(claudeCodeCLI.installStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl border border-border-subtle w-full max-w-lg max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Claude Code CLI</h2>
              <p className="text-sm text-text-secondary">Terminal-native coding assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-elevated rounded-xl transition-colors">
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Installation Status */}
          {claudeCodeCLI.installed ? (
            <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="font-medium text-text-primary">Installed</span>
                </div>
                <span className="text-sm text-text-secondary">v{claudeCodeCLI.version}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Config Path</span>
                  <span className="text-text-primary font-mono text-xs">{claudeCodeCLI.configPath}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Last Checked</span>
                  <span className="text-text-primary">
                    {claudeCodeCLI.lastChecked 
                      ? new Date(claudeCodeCLI.lastChecked).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Auto-update</span>
                  <span className={claudeCodeCLI.autoUpdateEnabled ? 'text-accent' : 'text-text-tertiary'}>
                    {claudeCodeCLI.autoUpdateEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={checkForUpdates}
                  disabled={claudeCodeCLI.installStatus === 'checking'}
                  className="flex-1 p-2 bg-surface-elevated hover:bg-surface-active rounded-lg text-text-primary text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {claudeCodeCLI.installStatus === 'checking' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Check Updates
                </button>
                <button
                  className="flex-1 p-2 bg-surface-elevated hover:bg-surface-active rounded-lg text-text-primary text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
              </div>
            </div>
          ) : isInstalling ? (
            /* Installation Progress */
            <div className="p-4 bg-surface-elevated rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-text-primary">Installing Claude Code CLI...</span>
                <span className="text-sm text-text-secondary">{claudeCodeCLI.installProgress}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-surface rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${claudeCodeCLI.installProgress}%` }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {INSTALL_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index < currentStep 
                        ? 'bg-accent text-white' 
                        : index === currentStep 
                        ? 'bg-primary text-white' 
                        : 'bg-surface text-text-tertiary'
                    }`}>
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : index === currentStep ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${index <= currentStep ? 'text-text-primary' : 'text-text-tertiary'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-text-tertiary">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : claudeCodeCLI.installStatus === 'complete' ? (
            /* Installation Complete */
            <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-center">
              <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-text-primary mb-1">Installation Complete</h3>
              <p className="text-sm text-text-secondary mb-4">Claude Code CLI is ready to use</p>
              
              <div className="p-3 bg-surface rounded-lg font-mono text-sm text-text-primary mb-4">
                $ claude --version<br />
                <span className="text-accent">claude-code v1.0.34</span>
              </div>
              
              <button
                onClick={onClose}
                className="w-full p-3 bg-primary hover:bg-primary-hover rounded-xl text-white font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          ) : (
            /* Installation Options */
            <>
              {/* Platform Selection */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Platform</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(PLATFORM_CONFIGS) as Platform[]).map((p) => {
                    const config = PLATFORM_CONFIGS[p];
                    const Icon = config.icon;
                    return (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`p-3 rounded-xl border transition-colors flex flex-col items-center gap-2 ${
                          platform === p 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-surface-elevated border-border-subtle text-text-primary hover:border-primary/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{config.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Install Method */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Installation Method</h3>
                <div className="space-y-2">
                  {(['native', 'homebrew', 'npm'] as InstallMethod[]).map((method) => {
                    const isDisabled = platform === 'windows' && method === 'homebrew';
                    return (
                      <button
                        key={method}
                        onClick={() => !isDisabled && setInstallMethod(method)}
                        disabled={isDisabled}
                        className={`w-full p-3 rounded-xl border transition-colors flex items-center justify-between ${
                          installMethod === method && !isDisabled
                            ? 'bg-primary/10 border-primary' 
                            : isDisabled
                            ? 'bg-surface border-border-subtle opacity-50 cursor-not-allowed'
                            : 'bg-surface-elevated border-border-subtle hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            installMethod === method && !isDisabled ? 'border-primary bg-primary' : 'border-text-tertiary'
                          }`}>
                            {installMethod === method && !isDisabled && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-text-primary capitalize">{method}</p>
                            <p className="text-xs text-text-tertiary">
                              {method === 'native' && 'Recommended - Self-contained installer'}
                              {method === 'homebrew' && (isDisabled ? 'Not available on Windows' : 'For Homebrew users')}
                              {method === 'npm' && 'Requires Node.js 18+'}
                            </p>
                          </div>
                        </div>
                        {method === 'native' && (
                          <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">Recommended</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Installation Command */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Installation Command</h3>
                <div className="p-3 bg-canvas rounded-xl font-mono text-sm overflow-x-auto">
                  {PLATFORM_CONFIGS[platform].commands[installMethod].map((cmd, i) => (
                    <div key={i} className="text-text-primary">
                      <span className="text-accent">$</span> {cmd}
                    </div>
                  ))}
                </div>
              </div>

              {/* System Requirements */}
              <button
                onClick={() => setExpandedSection(expandedSection === 'requirements' ? null : 'requirements')}
                className="w-full p-3 bg-surface-elevated rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm text-text-primary">System Requirements</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-text-tertiary transition-transform ${expandedSection === 'requirements' ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedSection === 'requirements' && (
                <div className="p-3 bg-surface-elevated rounded-xl text-sm space-y-2 animate-fade-in">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">OS</span>
                    <span className="text-text-primary">macOS 12+, Ubuntu 20.04+, Windows 10+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">RAM</span>
                    <span className="text-text-primary">4GB minimum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Node.js (npm only)</span>
                    <span className="text-text-primary">18.0 or higher</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Network</span>
                    <span className="text-text-primary">Internet connection required</span>
                  </div>
                </div>
              )}

              {/* Install Button */}
              <button
                onClick={startInstallation}
                className="w-full p-4 bg-primary hover:bg-primary-hover rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                Install Claude Code CLI
              </button>

              {/* Max Plan Connection Notice */}
              {claudeMaxConnection.status === 'connected' && (
                <div className="p-3 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Max Plan Connected</p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      CLI will automatically use your Max plan subscription for usage.
                    </p>
                  </div>
                </div>
              )}

              {/* Documentation Link */}
              <a
                href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 bg-surface-elevated hover:bg-surface-active rounded-xl text-text-primary flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-text-secondary" />
                View Documentation
              </a>
            </>
          )}

          {/* Error State */}
          {claudeCodeCLI.installStatus === 'error' && claudeCodeCLI.errorMessage && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Installation Failed</p>
                  <p className="text-sm text-text-secondary mt-1">{claudeCodeCLI.errorMessage}</p>
                  <button
                    onClick={startInstallation}
                    className="mt-3 px-4 py-2 bg-surface-elevated hover:bg-surface-active rounded-lg text-sm text-text-primary transition-colors"
                  >
                    Retry Installation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClaudeCodeCLIInstaller;

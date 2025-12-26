import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Zap, Code, Shield, TestTube, GitBranch, Search, Download, User, Layout, Cpu, Terminal, Sparkles, Server, FileCode, Activity } from 'lucide-react';
import { defaultTemplates, Template } from '../lib/db';
import { useStore } from '../store';
import { useMobileNav } from '../components/MobileNavigation';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser, setCurrentProject, openRouterApiKey, claudeCodeApiKey } = useStore();
  const { setShowTabBar } = useMobileNav();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setShowTabBar(true); }, [setShowTabBar]);

  const featuredTemplates = defaultTemplates.slice(0, 6);
  const isApiConfigured = openRouterApiKey || claudeCodeApiKey;

  const handleCreateNew = () => {
    const id = crypto.randomUUID();
    setCurrentProject(id, 'New Agent');
    navigate(`/builder/${id}`);
  };

  const handleUseTemplate = (template: Template) => {
    const id = crypto.randomUUID();
    setCurrentProject(id, template.name);
    navigate(`/builder/${id}?template=${template.id}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Development': return Code;
      case 'Debugging': return Zap;
      case 'Review': return Shield;
      case 'Security': return Shield;
      case 'DevOps': return GitBranch;
      case 'Advanced': return TestTube;
      default: return Code;
    }
  };

  return (
    <div className="min-h-screen bg-canvas pb-tab-bar">
      {/* Claude-themed Header */}
      <header className="pt-safe bg-canvas sticky top-0 z-30">
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-2 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary-hover rounded-claude flex items-center justify-center">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <span className="text-ios-headline md:text-ios-title3 text-text-primary font-semibold">Claude Agent Builder</span>
                <p className="text-xs text-text-tertiary hidden sm:block">Powered by Anthropic</p>
              </div>
            </div>
            {user ? (
              <button 
                onClick={() => navigate('/settings')}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-elevated flex items-center justify-center border border-border-subtle"
              >
                <User className="w-5 h-5 md:w-6 md:h-6 text-text-secondary" />
              </button>
            ) : (
              <button 
                onClick={() => setUser({ id: crypto.randomUUID(), email: 'demo@example.com' })}
                className="px-4 py-2 md:px-6 md:py-3 bg-primary text-white rounded-claude text-ios-subhead md:text-ios-body font-semibold hover:bg-primary-hover transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
          <h1 className="text-ios-large-title md:text-[40px] font-bold text-text-primary">
            Agent Builder
          </h1>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 md:px-6 lg:px-8 pb-4 max-w-6xl mx-auto">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents and templates..."
              className="claude-input pl-10"
            />
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 lg:px-8 space-y-6 md:space-y-8 max-w-6xl mx-auto">
        {/* API Status Banner - show if not configured */}
        {!isApiConfigured && (
          <button
            onClick={() => navigate('/settings')}
            className="w-full claude-card p-4 flex items-center gap-4 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-claude bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-ios-subhead font-semibold text-text-primary">Configure API Keys</h3>
              <p className="text-ios-caption1 text-text-secondary">Set up OpenRouter or Anthropic API keys to unlock full features</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        )}
        
        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button 
            onClick={handleCreateNew}
            className="claude-button-primary shadow-claude md:col-span-1 h-auto py-4"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Agent
          </button>
          
          <button
            onClick={() => navigate('/ide')}
            className="claude-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-claude bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <h3 className="text-ios-subhead font-semibold text-text-primary">Claude IDE</h3>
              <p className="text-ios-caption1 text-text-secondary">Code editor with plugins</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/mcp-builder')}
            className="claude-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-claude bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Server className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <h3 className="text-ios-subhead font-semibold text-text-primary">MCP Builder</h3>
              <p className="text-ios-caption1 text-text-secondary">Create MCP servers</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/research')}
            className="claude-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-claude bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-ios-subhead font-semibold text-text-primary">Research</h3>
              <p className="text-ios-caption1 text-text-secondary">AI-powered search</p>
            </div>
          </button>
        </section>

        {/* Feature Cards - mobile only */}
        <section className="grid grid-cols-2 gap-3 md:hidden">
          <div className="claude-card p-4">
            <div className="w-10 h-10 rounded-claude bg-secondary/20 flex items-center justify-center mb-3">
              <Layout className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-ios-subhead font-semibold text-text-primary">Visual Canvas</h3>
            <p className="text-ios-caption1 text-text-secondary mt-1">Drag and drop workflow</p>
          </div>
          <div className="claude-card p-4">
            <div className="w-10 h-10 rounded-claude bg-accent/20 flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-ios-subhead font-semibold text-text-primary">Export Scripts</h3>
            <p className="text-ios-caption1 text-text-secondary mt-1">Terminal setup files</p>
          </div>
        </section>

        {/* Recent Projects */}
        {user && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-ios-title3 font-semibold text-text-primary">Recent</h2>
              <button 
                onClick={() => navigate('/projects')}
                className="text-ios-subhead text-primary flex items-center gap-1 hover:underline"
              >
                See All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button 
                onClick={handleCreateNew}
                className="claude-card p-4 flex items-center gap-3 active:scale-[0.98] transition-transform hover:border-primary/50"
              >
                <div className="w-12 h-12 rounded-claude bg-primary/20 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-ios-body font-medium text-text-primary">New Project</p>
                  <p className="text-ios-caption1 text-text-secondary">Start from scratch</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary" />
              </button>
              <button 
                onClick={() => navigate('/ide')}
                className="claude-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-claude bg-surface-elevated flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-ios-body font-medium text-text-primary">TDD Workflow Agent</p>
                  <p className="text-ios-caption1 text-text-secondary">2 hours ago</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary" />
              </button>
              <div className="hidden lg:flex claude-card p-4 items-center gap-3">
                <div className="w-12 h-12 rounded-claude bg-surface-elevated flex items-center justify-center">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-ios-body font-medium text-text-primary">Security Auditor</p>
                  <p className="text-ios-caption1 text-text-secondary">Yesterday</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary" />
              </div>
            </div>
          </section>
        )}

        {/* Featured Templates */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-title3 font-semibold text-text-primary">Templates</h2>
            <button 
              onClick={() => navigate('/templates')}
              className="text-ios-subhead text-primary flex items-center gap-1 hover:underline"
            >
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {featuredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <button
                  key={template.id}
                  onClick={() => handleUseTemplate(template)}
                  className="w-full claude-card p-4 text-left active:scale-[0.98] transition-all hover:border-primary/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-claude bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-ios-body font-semibold text-text-primary truncate">{template.name}</h3>
                      </div>
                      <span className="text-ios-caption2 text-text-tertiary bg-surface-elevated px-2 py-0.5 rounded-claude inline-block mb-2">
                        {template.category}
                      </span>
                      <p className="text-ios-footnote text-text-secondary line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-ios-caption1 text-text-tertiary">
                        <Download className="w-3 h-3" />
                        <span>{template.downloads}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
        
        {/* Anthropic Plugins Section */}
        <section className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-title3 font-semibold text-text-primary">Anthropic Integrations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="claude-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-claude bg-primary/20 flex items-center justify-center">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-ios-subhead font-semibold text-text-primary">Claude Code</h3>
                  <p className="text-xs text-accent">Active</p>
                </div>
              </div>
              <p className="text-ios-footnote text-text-secondary">Terminal-native agentic coding with file editing and command execution.</p>
            </div>
            <div className="claude-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-claude bg-secondary/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-ios-subhead font-semibold text-text-primary">MCP Protocol</h3>
                  <p className="text-xs text-accent">Active</p>
                </div>
              </div>
              <p className="text-ios-footnote text-text-secondary">Model Context Protocol for external tool integration and automation.</p>
            </div>
            <div className="claude-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-claude bg-accent/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-ios-subhead font-semibold text-text-primary">Enterprise</h3>
                  <p className="text-xs text-text-tertiary">Available</p>
                </div>
              </div>
              <p className="text-ios-footnote text-text-secondary">SSO, audit logging, compliance API, and advanced governance features.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
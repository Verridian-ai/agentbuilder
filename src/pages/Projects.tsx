import { useEffect } from 'react';
import { ChevronRight, FolderOpen, Clock, Plus, Code, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useMobileNav } from '../components/MobileNavigation';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { setCurrentProject } = useStore();
  const { setShowTabBar } = useMobileNav();

  useEffect(() => { setShowTabBar(true); }, [setShowTabBar]);

  const handleCreateNew = () => {
    const id = crypto.randomUUID();
    setCurrentProject(id, 'New Agent');
    navigate(`/builder/${id}`);
  };

  const projects = [
    { id: '1', name: 'TDD Workflow Agent', updated: '2 hours ago', status: 'draft', icon: Code, color: 'blue' },
    { id: '2', name: 'Code Review Bot', updated: 'Yesterday', status: 'active', icon: Shield, color: 'green' },
    { id: '3', name: 'Debug Assistant', updated: '3 days ago', status: 'draft', icon: Zap, color: 'orange' },
    { id: '4', name: 'Security Auditor', updated: '1 week ago', status: 'active', icon: Shield, color: 'purple' },
    { id: '5', name: 'Deploy Pipeline', updated: '2 weeks ago', status: 'draft', icon: Code, color: 'blue' },
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-ios-blue bg-ios-blue/20';
      case 'green': return 'text-ios-green bg-ios-green/20';
      case 'orange': return 'text-ios-orange bg-ios-orange/20';
      case 'purple': return 'text-ios-purple bg-ios-purple/20';
      default: return 'text-ios-blue bg-ios-blue/20';
    }
  };

  return (
    <div className="min-h-screen bg-canvas pb-tab-bar">
      <header className="pt-safe bg-canvas sticky top-0 z-30 border-b border-ios-separator">
        <div className="px-4 md:px-6 lg:px-8 py-3 max-w-6xl mx-auto">
          <h1 className="text-ios-large-title md:text-[40px] font-bold text-text-primary">Projects</h1>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <button 
          onClick={handleCreateNew}
          className="w-full md:w-auto ios-button-primary md:px-8"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </button>

        {/* Responsive grid for tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {projects.map((project) => {
            const Icon = project.icon;
            const colorClasses = getIconColor(project.color);
            return (
              <button
                key={project.id}
                onClick={() => navigate(`/builder/${project.id}`)}
                className="ios-card p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform w-full"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-ios-lg flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ios-body md:text-ios-headline font-medium text-text-primary truncate">{project.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Clock className="w-3 h-3" />
                      <span className="text-ios-caption1">{project.updated}</span>
                    </div>
                    <span className={`text-ios-caption2 px-2 py-0.5 rounded-ios-full ${
                      project.status === 'active' ? 'bg-ios-green/20 text-ios-green' : 'bg-surface-elevated text-text-tertiary'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary flex-shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="text-center py-4 text-text-tertiary">
          <p className="text-ios-footnote">{projects.length} projects</p>
        </div>
      </main>
    </div>
  );
}

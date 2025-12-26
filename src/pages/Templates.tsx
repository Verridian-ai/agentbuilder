import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Code, Zap, Shield, TestTube, GitBranch, Download, Search } from 'lucide-react';
import { defaultTemplates, Template } from '../lib/db';
import { useStore } from '../store';
import { useMobileNav } from '../components/MobileNavigation';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { setCurrentProject } = useStore();
  const { setShowTabBar } = useMobileNav();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => { setShowTabBar(true); }, [setShowTabBar]);

  const categories = [...new Set(defaultTemplates.map((t) => t.category))];

  const filteredTemplates = defaultTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      <header className="pt-safe bg-canvas sticky top-0 z-30">
        <div className="px-4 md:px-6 lg:px-8 py-3 max-w-6xl mx-auto">
          <h1 className="text-ios-large-title md:text-[40px] font-bold text-text-primary">Templates</h1>
        </div>
        <div className="px-4 md:px-6 lg:px-8 pb-3 max-w-6xl mx-auto">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="ios-input pl-10"
            />
          </div>
        </div>
        <div className="px-4 md:px-6 lg:px-8 pb-3 flex gap-2 overflow-x-auto scrollbar-none max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-ios-full text-ios-subhead font-medium whitespace-nowrap transition-colors
              ${!selectedCategory ? 'bg-ios-blue text-white' : 'bg-surface-elevated text-text-secondary'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-4 py-2 rounded-ios-full text-ios-subhead font-medium whitespace-nowrap transition-colors
                ${cat === selectedCategory ? 'bg-ios-blue text-white' : 'bg-surface-elevated text-text-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredTemplates.map((template) => {
            const CategoryIcon = getCategoryIcon(template.category);
            return (
              <button
                key={template.id}
                onClick={() => handleUseTemplate(template)}
                className="w-full ios-card p-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-ios-lg bg-ios-blue/10 flex items-center justify-center flex-shrink-0">
                    <CategoryIcon className="w-6 h-6 md:w-7 md:h-7 text-ios-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-ios-body md:text-ios-headline font-semibold text-text-primary truncate">{template.name}</h3>
                    </div>
                    <span className="text-ios-caption2 text-text-tertiary bg-surface-elevated px-2 py-0.5 rounded-ios-full inline-block mb-2">
                      {template.category}
                    </span>
                    <p className="text-ios-footnote text-text-secondary line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-ios-caption1 text-text-tertiary">
                      <Download className="w-3 h-3" />
                      <span>{template.downloads} uses</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-1 hidden md:block" />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Cpu, Settings, Network, Search, Cloud } from 'lucide-react';

interface MobileNavContextType {
  showTabBar: boolean;
  setShowTabBar: (show: boolean) => void;
  activeSheet: string | null;
  openSheet: (id: string) => void;
  closeSheet: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | null>(null);

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) throw new Error('useMobileNav must be used within MobileNavProvider');
  return context;
}

interface MobileNavProviderProps {
  children: ReactNode;
}

export function MobileNavProvider({ children }: MobileNavProviderProps) {
  const [showTabBar, setShowTabBar] = useState(true);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const openSheet = (id: string) => setActiveSheet(id);
  const closeSheet = () => setActiveSheet(null);

  return (
    <MobileNavContext.Provider value={{ showTabBar, setShowTabBar, activeSheet, openSheet, closeSheet }}>
      {children}
    </MobileNavContext.Provider>
  );
}

// Claude-themed Tab Bar
export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showTabBar } = useMobileNav();

  const tabs = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'network', path: '/network', icon: Network, label: 'Network' },
    { id: 'cloud-ide', path: '/cloud-ide', icon: Cloud, label: 'Cloud' },
    { id: 'research', path: '/research', icon: Search, label: 'Research' },
    { id: 'settings', path: '/settings', icon: Settings, label: 'Settings' },
  ];

  if (!showTabBar) return null;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="ios-tab-bar md:hidden">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors touch-target
                ${active ? 'text-primary' : 'text-text-tertiary'}`}
            >
              <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              <span className="text-ios-caption2 mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Navigation Bar
interface NavBarProps {
  title: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  large?: boolean;
  transparent?: boolean;
}

export function NavBar({ title, leftAction, rightAction, large = false, transparent = false }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`ios-nav-bar transition-all duration-200
        ${transparent && !scrolled ? 'bg-transparent backdrop-blur-none' : ''}
        ${scrolled ? 'border-b border-border-subtle' : ''}`}
    >
      <div className="flex items-center justify-between h-[44px] px-4">
        <div className="w-20 flex justify-start">
          {leftAction}
        </div>
        {!large && (
          <h1 className="text-ios-headline font-semibold text-text-primary truncate">
            {title}
          </h1>
        )}
        <div className="w-20 flex justify-end">
          {rightAction}
        </div>
      </div>
      {large && (
        <div className="px-4 pb-2">
          <h1 className="text-ios-large-title font-bold text-text-primary">
            {title}
          </h1>
        </div>
      )}
    </header>
  );
}

// Bottom Sheet
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[];
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0) setCurrentY(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-40 animate-ios-fade-in"
        onClick={onClose}
      />
      <div 
        className="ios-sheet animate-ios-slide-up z-50"
        style={{ transform: `translateY(${currentY}px)` }}
      >
        <div 
          className="flex flex-col items-center pt-3 pb-2 cursor-grab"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-9 h-1 bg-text-tertiary rounded-full" />
        </div>
        {title && (
          <div className="px-4 py-3 border-b border-border-subtle">
            <h2 className="text-ios-headline font-semibold text-center text-text-primary">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </>
  );
}

// Action Sheet
interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    destructive?: boolean;
  }>;
}

export function ActionSheet({ isOpen, onClose, title, message, actions }: ActionSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-40 animate-ios-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-2 bottom-2 z-50 animate-ios-slide-up pb-safe">
        <div className="bg-surface-elevated rounded-claude overflow-hidden mb-2">
          {(title || message) && (
            <div className="px-4 py-3 text-center border-b border-border-subtle">
              {title && <p className="text-ios-footnote text-text-secondary font-semibold">{title}</p>}
              {message && <p className="text-ios-footnote text-text-tertiary mt-1">{message}</p>}
            </div>
          )}
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => { action.onClick(); onClose(); }}
              className={`w-full min-h-touch px-4 text-ios-body text-center transition-colors active:bg-surface-active
                ${index > 0 ? 'border-t border-border-subtle' : ''}
                ${action.destructive ? 'text-destructive' : 'text-primary'}`}
            >
              {action.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full min-h-touch bg-surface-elevated rounded-claude text-primary font-semibold text-ios-body active:bg-surface-active"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

// Toast Notification
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onHide: () => void;
}

export function Toast({ message, type = 'info', isVisible, onHide }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  const colors = {
    success: 'bg-accent',
    error: 'bg-destructive',
    info: 'bg-surface-elevated',
  };

  return (
    <div className="fixed top-safe left-4 right-4 z-50 animate-ios-slide-up pt-4">
      <div className={`${colors[type]} rounded-claude px-4 py-3 shadow-claude-lg claude-glass`}>
        <p className="text-ios-subhead text-text-primary text-center">{message}</p>
      </div>
    </div>
  );
}

// Pull to Refresh Hook
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullDistance(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      const touch = e.touches[0];
      const distance = Math.max(0, touch.clientY - (e.currentTarget as HTMLElement).getBoundingClientRect().top - 100);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  return {
    isRefreshing,
    pullDistance,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
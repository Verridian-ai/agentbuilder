import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Save, Copy, Undo, Redo, Search, Replace, Settings2,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Code, Type,
  WrapText, Hash, CheckCircle2
} from 'lucide-react';

interface CloudCodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  language?: string;
  fileName?: string;
  readOnly?: boolean;
  isSaving?: boolean;
}

// Simple syntax keywords for highlighting preview
const KEYWORDS: Record<string, string[]> = {
  typescript: ['import', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'from', 'default'],
  javascript: ['import', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'from', 'default'],
  json: [],
  css: ['@import', '@media', '@keyframes', '@font-face'],
  markdown: [],
};

export default function CloudCodeEditor({
  content,
  onChange,
  onSave,
  language = 'typescript',
  fileName = 'untitled',
  readOnly = false,
  isSaving = false,
}: CloudCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showCopied, setShowCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate line numbers
  const lines = content.split('\n');
  const lineCount = lines.length;

  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Update cursor position
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return;
    
    const { selectionStart } = textareaRef.current;
    const textBeforeCursor = content.substring(0, selectionStart);
    const linesBeforeCursor = textBeforeCursor.split('\n');
    const line = linesBeforeCursor.length;
    const column = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
    
    setCursorPosition({ line, column });
  }, [content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const newContent = content.substring(0, selectionStart) + '  ' + content.substring(selectionEnd);
      onChange(newContent);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 2;
        }
      }, 0);
    }
  };

  return (
    <div className={`flex flex-col bg-canvas ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* Toolbar */}
      <div className="h-10 bg-surface-elevated border-b border-border-subtle flex items-center justify-between px-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            disabled={isSaving || readOnly}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 bg-primary/10 text-primary hover:bg-primary/20"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Save</span>
          </button>
          
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-active transition-colors relative"
            title="Copy"
          >
            {showCopied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <div className="w-px h-5 bg-border-subtle mx-1" />
          
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg transition-colors ${showSearch ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-surface-active'}`}
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize(Math.max(10, fontSize - 2))}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-active transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-tertiary w-8 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-active transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-border-subtle mx-1" />
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-surface-active'}`}
            title="Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-active transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="h-10 bg-surface-elevated border-b border-border-subtle flex items-center px-3 gap-2">
          <Search className="w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none"
            autoFocus
          />
          <span className="text-xs text-text-tertiary">
            {searchQuery && `${content.split(searchQuery).length - 1} matches`}
          </span>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-surface-elevated border-b border-border-subtle p-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="w-4 h-4 rounded border-border-subtle"
            />
            <Hash className="w-4 h-4" />
            Line Numbers
          </label>
          
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
              className="w-4 h-4 rounded border-border-subtle"
            />
            <WrapText className="w-4 h-4" />
            Word Wrap
          </label>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        {showLineNumbers && (
          <div
            ref={lineNumbersRef}
            className="w-12 bg-surface-elevated border-r border-border-subtle overflow-hidden select-none flex-shrink-0"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
          >
            <div className="py-3 pr-2 text-right">
              {Array.from({ length: lineCount }, (_, i) => (
                <div
                  key={i}
                  className={`text-text-tertiary ${cursorPosition.line === i + 1 ? 'text-text-secondary font-medium' : ''}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleTabKey}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          readOnly={readOnly}
          spellCheck={false}
          className={`flex-1 bg-canvas text-text-primary font-mono p-3 outline-none resize-none ${
            wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
          }`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.5',
            tabSize: 2,
          }}
          placeholder="// Start coding..."
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-surface-elevated border-t border-border-subtle flex items-center justify-between px-3 text-xs text-text-tertiary flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            {language}
          </span>
          <span>{fileName}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          <span>{lineCount} lines</span>
          <span>{content.length} chars</span>
        </div>
      </div>
    </div>
  );
}

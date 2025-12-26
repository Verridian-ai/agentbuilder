import { useState } from 'react';
import { NavBar, BottomSheet } from '../components/MobileNavigation';
import { Search, BookOpen, Clock, Sparkles, Send, ChevronRight, Loader2, AlertCircle, ExternalLink, X } from 'lucide-react';
import { useStore } from '../store';

export default function ResearchPage() {
  const { researchHistory, addResearchResult, clearResearchHistory, openRouterApiKey, isResearching, setIsResearching } = useStore();
  const [query, setQuery] = useState('');
  const [currentResult, setCurrentResult] = useState<{ query: string; result: string; sources?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResultSheet, setShowResultSheet] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    if (!openRouterApiKey) {
      setError('Please configure your OpenRouter API key in Settings to use research features.');
      return;
    }

    setError(null);
    setIsResearching(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'perplexity/llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a network infrastructure expert. Provide detailed, technical answers about network automation, configuration, protocols, and best practices. Include specific commands or configurations when relevant.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.choices?.[0]?.message?.content || 'No response received.';
      
      const result = {
        id: crypto.randomUUID(),
        query: query.trim(),
        result: resultText,
        sources: [],
        timestamp: new Date().toISOString(),
      };

      addResearchResult(result);
      setCurrentResult(result);
      setShowResultSheet(true);
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed. Please try again.');
    } finally {
      setIsResearching(false);
    }
  };

  const viewHistoryItem = (item: typeof researchHistory[0]) => {
    setCurrentResult(item);
    setShowResultSheet(true);
  };

  return (
    <div className="min-h-screen bg-canvas pb-24">
      <NavBar title="Research" large />
      
      <div className="px-4 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-ios-red/10 border border-ios-red/20 rounded-ios-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-ios-red flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-ios-subhead text-ios-red">{error}</p>
            </div>
            <button onClick={() => setError(null)}>
              <X className="w-5 h-5 text-ios-red" />
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about network automation..."
            className="ios-input pr-12"
            onKeyDown={(e) => e.key === 'Enter' && !isResearching && handleSearch()}
            disabled={isResearching}
          />
          <button 
            onClick={handleSearch}
            disabled={isResearching || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ios-blue flex items-center justify-center active:opacity-80 disabled:opacity-50"
          >
            {isResearching ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Quick Topics */}
        <section>
          <h2 className="text-ios-headline font-semibold mb-3">Quick Research</h2>
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 scrollbar-hide">
            {['Network Security Best Practices', 'Cisco IOS Commands', 'BGP Configuration', 'VLAN Setup Guide', 'Juniper JunOS'].map(topic => (
              <button
                key={topic}
                onClick={() => setQuery(topic)}
                disabled={isResearching}
                className="px-4 py-2 bg-surface-secondary rounded-full text-ios-subhead text-text-primary whitespace-nowrap active:bg-surface-active disabled:opacity-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        {/* API Status */}
        {!openRouterApiKey && (
          <section className="ios-card bg-ios-orange/10 border border-ios-orange/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-ios-orange mt-0.5" />
              <div>
                <p className="text-ios-body font-medium text-text-primary">API Key Required</p>
                <p className="text-ios-caption1 text-text-tertiary">Configure your OpenRouter API key in Settings to enable research.</p>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="ios-card">
          <h2 className="text-ios-headline font-semibold mb-4">Powered by Perplexity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-ios-purple mt-0.5" />
              <div>
                <p className="text-ios-body font-medium text-text-primary">Deep Research</p>
                <p className="text-ios-caption1 text-text-tertiary">Real-time web search for network topics</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-ios-blue mt-0.5" />
              <div>
                <p className="text-ios-body font-medium text-text-primary">Documentation</p>
                <p className="text-ios-caption1 text-text-tertiary">Search vendor docs and RFCs</p>
              </div>
            </div>
          </div>
        </section>

        {/* History */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ios-headline font-semibold">Recent Research</h2>
            {researchHistory.length > 0 && (
              <button onClick={clearResearchHistory} className="text-ios-blue text-ios-subhead">Clear</button>
            )}
          </div>
          
          {researchHistory.length === 0 ? (
            <div className="ios-card text-center py-8">
              <Clock className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary text-ios-body">No research history</p>
              <p className="text-text-tertiary text-ios-caption1 mt-1">Your searches will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {researchHistory.map(item => (
                <button 
                  key={item.id}
                  onClick={() => viewHistoryItem(item)}
                  className="ios-card w-full flex items-center gap-4 active:bg-surface-active"
                >
                  <div className="w-10 h-10 rounded-ios bg-ios-blue/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-ios-blue" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-ios-body font-medium text-text-primary line-clamp-1">{item.query}</p>
                    <p className="text-ios-caption1 text-text-tertiary">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-tertiary" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Result Sheet */}
      <BottomSheet isOpen={showResultSheet} onClose={() => setShowResultSheet(false)} title="Research Result">
        {currentResult && (
          <div className="p-4 space-y-4">
            <div className="bg-surface-secondary rounded-ios-lg p-3">
              <p className="text-ios-footnote text-text-tertiary mb-1">Query</p>
              <p className="text-ios-body text-text-primary">{currentResult.query}</p>
            </div>
            
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-ios-body text-text-primary whitespace-pre-wrap leading-relaxed">
                {currentResult.result}
              </div>
            </div>

            {currentResult.sources && currentResult.sources.length > 0 && (
              <div className="pt-4 border-t border-ios-separator">
                <p className="text-ios-footnote text-text-tertiary mb-2">Sources</p>
                <div className="space-y-2">
                  {currentResult.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-ios-blue text-ios-subhead"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {source}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

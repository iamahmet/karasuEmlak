'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, FileText, Tag, FolderOpen, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSearchSuggestions, saveSearchHistory, getSearchHistory, clearSearchHistory, trackSearch, type SearchSuggestion } from '@/lib/services/search-enhanced';
import { cn } from '@karasu/lib';
import { Input } from '@karasu/ui';
import { Button } from '@karasu/ui';

interface EnhancedBlogSearchProps {
  basePath?: string;
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

/**
 * Enhanced Blog Search Component
 * Features: Suggestions, history, analytics
 */
export function EnhancedBlogSearch({
  basePath = '',
  className,
  placeholder = 'Makale, kategori veya etiket ara...',
  onSearch,
}: EnhancedBlogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState(getSearchHistory());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (query.length >= 2) {
      setIsLoading(true);
      getSearchSuggestions(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setIsLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Update history when it changes
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return;
    }

    const trimmedQuery = searchQuery.trim();
    setShowSuggestions(false);

    // Navigate to search results
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', trimmedQuery);
    params.set('page', '1');
    router.push(`${basePath}/blog?${params.toString()}`);

    // Track search
    trackSearch(trimmedQuery, 0);

    // Save to history
    saveSearchHistory(trimmedQuery);

    // Callback
    if (onSearch) {
      onSearch(trimmedQuery);
    }
  }, [basePath, router, searchParams, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.url) {
      router.push(suggestion.url);
    } else {
      setQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
    setShowSuggestions(false);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const displaySuggestions = showSuggestions && (suggestions.length > 0 || history.length > 0);

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Aramayı temizle"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {displaySuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-[400px] overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" />
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Öneriler
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors"
                >
                  {suggestion.type === 'query' && <TrendingUp className="h-4 w-4 text-slate-400" />}
                  {suggestion.type === 'article' && <FileText className="h-4 w-4 text-slate-400" />}
                  {suggestion.type === 'category' && <FolderOpen className="h-4 w-4 text-slate-400" />}
                  {suggestion.type === 'tag' && <Tag className="h-4 w-4 text-slate-400" />}
                  <span className="flex-1 text-sm text-slate-900 dark:text-slate-100">
                    {suggestion.text}
                  </span>
                  {suggestion.count && (
                    <span className="text-xs text-slate-400">{suggestion.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {!isLoading && query.length < 2 && history.length > 0 && (
            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Son Aramalar
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Temizle
                </button>
              </div>
              {history.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(item.query)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="flex-1 text-sm text-slate-900 dark:text-slate-100">
                    {item.query}
                  </span>
                  {item.resultsCount !== undefined && (
                    <span className="text-xs text-slate-400">{item.resultsCount} sonuç</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

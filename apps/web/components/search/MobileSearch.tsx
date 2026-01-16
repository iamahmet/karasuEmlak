'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Mic, QrCode, Clock, Trash2 } from 'lucide-react';
import { Input } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';
import { useRouter, useSearchParams } from 'next/navigation';
import { hapticButtonPress } from '@/lib/mobile/haptics';

interface MobileSearchProps {
  placeholder?: string;
  className?: string;
  basePath?: string;
  onSearch?: (query: string) => void;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

const MAX_HISTORY = 10;

function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = localStorage.getItem('search-history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const history = getSearchHistory();
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
    };
    
    // Remove duplicates
    const filtered = history.filter(item => item.query.toLowerCase() !== query.trim().toLowerCase());
    
    // Add new item at the beginning
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    
    localStorage.setItem('search-history', JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save search history:', error);
  }
}

function clearSearchHistory() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('search-history');
  } catch (error) {
    console.warn('Failed to clear search history:', error);
  }
}

export function MobileSearch({
  placeholder = 'Ara...',
  className,
  basePath = '',
  onSearch,
}: MobileSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const history = getSearchHistory();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'tr-TR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Close history on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    hapticButtonPress();
    saveSearchHistory(searchQuery);
    setShowHistory(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchQuery.trim());
    params.delete('page'); // Reset to first page
    router.push(`${basePath}/satilik?${params.toString()}`);

    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  }, [query, searchParams, router, basePath, onSearch]);

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      if (typeof window !== 'undefined') {
        alert('Tarayıcınız sesli aramayı desteklemiyor');
      }
      return;
    }

    hapticButtonPress();
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setIsListening(false);
      }
    }
  };

  const handleQRScan = () => {
    hapticButtonPress();
    // QR code scanning would require a library like jsQR
    // For now, show a placeholder
    alert('QR kod tarama özelliği yakında eklenecek');
  };

  const handleHistoryClick = (historyQuery: string) => {
    hapticButtonPress();
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  const handleClearHistory = () => {
    hapticButtonPress();
    clearSearchHistory();
    setShowHistory(false);
  };

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="pl-10 pr-24 min-h-[48px] text-base touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        />
        
        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                hapticButtonPress();
                setQuery('');
                setShowHistory(false);
              }}
              className="h-8 w-8 min-h-[44px] min-w-[44px] touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceSearch}
            className={cn(
              "h-8 w-8 min-h-[44px] min-w-[44px] touch-manipulation",
              isListening && "bg-red-100 text-red-600 animate-pulse"
            )}
            style={{ touchAction: 'manipulation' }}
            disabled={!recognitionRef.current}
            title="Sesli ara"
          >
            <Mic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleQRScan}
            className="h-8 w-8 min-h-[44px] min-w-[44px] touch-manipulation"
            style={{ touchAction: 'manipulation' }}
            title="QR kod tara"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search History Dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 px-2">Son Aramalar</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="h-7 px-2 text-xs touch-manipulation min-h-[32px]"
              style={{ touchAction: 'manipulation' }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Temizle
            </Button>
          </div>
          <div className="py-1">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item.query)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 touch-manipulation min-h-[44px]"
                style={{ touchAction: 'manipulation' }}
              >
                <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-700 flex-1">{item.query}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

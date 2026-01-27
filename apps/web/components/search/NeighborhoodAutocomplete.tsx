"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, X } from "lucide-react";
import { cn } from "@karasu/lib";

interface NeighborhoodAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  neighborhoods?: string[];
  className?: string;
}

export function NeighborhoodAutocomplete({
  value,
  onChange,
  neighborhoods = [],
  className,
}: NeighborhoodAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Popular neighborhoods (fallback if API fails)
  const popularNeighborhoods = [
    'Merkez', 'Sahil', 'Liman', 'Çamlık', 'Yeni Mahalle',
    'Atatürk', 'Cumhuriyet', 'İnköy', 'Kızılcık', 'Kestane',
  ];

  const allNeighborhoods = neighborhoods.length > 0 ? neighborhoods : popularNeighborhoods;

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = allNeighborhoods
        .filter(n => n.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setFilteredNeighborhoods(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredNeighborhoods([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value, allNeighborhoods]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredNeighborhoods.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredNeighborhoods.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredNeighborhoods.length) {
          handleSelect(filteredNeighborhoods[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (neighborhood: string) => {
    onChange(neighborhood);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && filteredNeighborhoods.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Mahalle ara..."
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg text-[15px] font-medium focus:border-blue-600 focus:outline-none transition-colors"
          aria-label="Mahalle ara"
          aria-autocomplete="list"
          aria-expanded={isOpen ? "true" : "false"}
          aria-controls="neighborhood-suggestions"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Temizle"
            type="button"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && filteredNeighborhoods.length > 0 && (
        <div
          id="neighborhood-suggestions"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {filteredNeighborhoods.map((neighborhood, index) => (
            <button
              key={neighborhood}
              onClick={() => handleSelect(neighborhood)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors",
                "hover:bg-blue-50 focus:bg-blue-50 focus:outline-none",
                highlightedIndex === index && "bg-blue-50"
              )}
              role="option"
              aria-selected={highlightedIndex === index ? "true" : "false"}
              type="button"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span>{neighborhood}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Popular Suggestions (when input is empty) */}
      {!value && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1.5 font-medium">Popüler Mahalleler:</p>
          <div className="flex flex-wrap gap-1.5">
            {popularNeighborhoods.slice(0, 5).map((neighborhood) => (
              <button
                key={neighborhood}
                onClick={() => handleSelect(neighborhood)}
                className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md transition-colors"
                type="button"
              >
                {neighborhood}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

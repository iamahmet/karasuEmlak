/**
 * Contrast Checker Component
 * Runtime contrast checking for dynamic content (development only)
 */

'use client';

import { useEffect, useState } from 'react';
import { checkContrast } from '@/lib/accessibility/contrast-checker';

interface ContrastIssue {
  element: HTMLElement;
  foreground: string;
  background: string;
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  pass: boolean;
}

export default function ContrastChecker() {
  const [issues, setIssues] = useState<ContrastIssue[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable in development
    if (process.env.NODE_ENV !== 'development') return;
    
    // Enable with keyboard shortcut: Ctrl+Shift+C (Cmd+Shift+C on Mac)
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setEnabled(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIssues([]);
      return;
    }

    const checkAllTextElements = () => {
      const textElements = document.querySelectorAll<HTMLElement>(
        'p, span, a, h1, h2, h3, h4, h5, h6, label, button, input, select, textarea, li, td, th'
      );

      const foundIssues: ContrastIssue[] = [];

      textElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const foreground = styles.color;
        const background = getBackgroundColor(element);
        
        if (!foreground || !background) return;

        // Convert RGB to hex
        const fgHex = rgbToHex(foreground);
        const bgHex = rgbToHex(background);
        
        if (!fgHex || !bgHex) return;

        const isLargeText = isLargeTextElement(element);
        const result = checkContrast(fgHex, bgHex, isLargeText);

        if (!result.pass) {
          foundIssues.push({
            element,
            foreground: fgHex,
            background: bgHex,
            ratio: result.ratio,
            level: result.level,
            pass: result.pass,
          });
        }
      });

      setIssues(foundIssues);
    };

    checkAllTextElements();
    
    // Recheck on resize or theme change
    const observer = new MutationObserver(checkAllTextElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled || issues.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-4 max-w-md z-50 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
          Contrast Issues Found: {issues.length}
        </h3>
        <button
          onClick={() => setEnabled(false)}
          className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
          aria-label="Close contrast checker"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {issues.slice(0, 10).map((issue, index) => (
          <div
            key={index}
            className="text-xs text-yellow-800 dark:text-yellow-200 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded cursor-pointer"
            onClick={() => {
              issue.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              issue.element.style.outline = '2px solid red';
              setTimeout(() => {
                issue.element.style.outline = '';
              }, 2000);
            }}
          >
            <div className="font-semibold">
              {issue.element.tagName.toLowerCase()}: {issue.level} ({issue.ratio}:1)
            </div>
            <div className="text-xs opacity-75">
              {issue.element.textContent?.substring(0, 50)}...
            </div>
          </div>
        ))}
        {issues.length > 10 && (
          <div className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
            ...and {issues.length - 10} more issues
          </div>
        )}
      </div>
      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
        Press Ctrl+Shift+C (Cmd+Shift+C) to toggle
      </p>
    </div>
  );
}

function getBackgroundColor(element: HTMLElement): string {
  const styles = window.getComputedStyle(element);
  let bgColor = styles.backgroundColor;
  
  // If background is transparent, check parent
  if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
    const parent = element.parentElement;
    if (parent) {
      return getBackgroundColor(parent);
    }
  }
  
  return bgColor || '#ffffff';
}

function rgbToHex(rgb: string): string | null {
  if (rgb.startsWith('#')) return rgb;
  
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  
  const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
  const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

function isLargeTextElement(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element);
  const fontSize = parseFloat(styles.fontSize);
  const fontWeight = parseFloat(styles.fontWeight);
  
  // Large text: 18pt+ or 14pt+ bold
  return fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
}

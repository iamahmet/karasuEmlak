/**
 * Skip Links Component
 * WCAG AAA compliance - allows keyboard users to skip to main content
 */

'use client';

import { useEffect, useState } from 'react';

export default function SkipLinks() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip links when Tab is pressed
      if (e.key === 'Tab' && !isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseDown = () => {
      // Hide skip links when mouse is used
      setIsVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          setIsVisible(false);
        }}
      >
        Ana içeriğe geç
      </a>
      <a
        href="#navigation"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const navigation = document.getElementById('navigation');
          if (navigation) {
            navigation.focus();
            navigation.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          setIsVisible(false);
        }}
      >
        Navigasyona geç
      </a>
      <a
        href="#search"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const search = document.getElementById('search');
          if (search) {
            (search as HTMLElement).focus();
            search.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          setIsVisible(false);
        }}
      >
        Aramaya geç
      </a>
      <style jsx>{`
        .skip-links {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border-bottom: 2px solid #e5e7eb;
        }
        .skip-link {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .skip-link:hover,
        .skip-link:focus {
          background: #1d4ed8;
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        @media (prefers-color-scheme: dark) {
          .skip-links {
            background: #111827;
            border-bottom-color: #374151;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Enhanced Accessibility Utilities
 * 
 * Advanced accessibility helpers for better a11y support
 */

import { prefersReducedMotion } from './a11y';

/**
 * Announce message to screen readers with priority
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    if (announcement.parentNode) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Focus element with smooth scroll
 */
export function focusElement(
  element: HTMLElement | null,
  options: { preventScroll?: boolean; smooth?: boolean } = {}
): void {
  if (!element) return;

  const { preventScroll = false, smooth = false } = options;

  if (smooth && !prefersReducedMotion()) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => element.focus({ preventScroll }), 100);
  } else {
    element.focus({ preventScroll });
  }
}

/**
 * Get accessible name for element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent || '';
  }

  // Check title attribute
  const title = element.getAttribute('title');
  if (title) return title;

  // Fallback to text content
  return element.textContent?.trim() || '';
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  
  // Check visibility
  if (style.visibility === 'hidden' || style.display === 'none') {
    return false;
  }

  // Check aria-hidden
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check if element has sr-only class but is actually hidden
  if (element.classList.contains('sr-only')) {
    return false;
  }

  return true;
}

/**
 * Create skip link
 */
export function createSkipLink(targetId: string, label: string = 'Ana içeriğe geç'): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = label;
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';
  return link;
}

/**
 * Enhance keyboard navigation for custom components
 */
export function enhanceKeyboardNavigation(
  container: HTMLElement,
  options: {
    arrowKeys?: boolean;
    homeEnd?: boolean;
    escape?: () => void;
  } = {}
): () => void {
  const { arrowKeys = true, homeEnd = true, escape } = options;

  const handleKeyDown = (e: KeyboardEvent) => {
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    // Arrow keys
    if (arrowKeys) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex]?.focus();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentIndex === -1 ? focusableElements.length - 1 : (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        focusableElements[prevIndex]?.focus();
        return;
      }
    }

    // Home/End keys
    if (homeEnd) {
      if (e.key === 'Home') {
        e.preventDefault();
        focusableElements[0]?.focus();
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        return;
      }
    }

    // Escape key
    if (e.key === 'Escape' && escape) {
      escape();
      return;
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Check color contrast ratio
 */
export function checkContrastRatio(foreground: string, background: string): number {
  // Simplified contrast calculation
  // In production, use a proper library like 'color-contrast-checker'
  
  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  // Calculate relative luminance
  const getLuminance = (rgb: [number, number, number]): number => {
    const [r, g, b] = rgb.map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  const fgLum = getLuminance(fgRgb);
  const bgLum = getLuminance(bgRgb);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate ARIA attributes
 */
export function validateARIA(element: HTMLElement): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check aria-label and aria-labelledby
  const hasLabel = element.hasAttribute('aria-label');
  const hasLabelledBy = element.hasAttribute('aria-labelledby');
  
  if (hasLabel && hasLabelledBy) {
    warnings.push('Both aria-label and aria-labelledby are present. aria-labelledby will take precedence.');
  }

  // Check aria-describedby
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const describedElement = document.getElementById(describedBy);
    if (!describedElement) {
      errors.push(`aria-describedby references non-existent element: ${describedBy}`);
    }
  }

  // Check aria-controls
  const controls = element.getAttribute('aria-controls');
  if (controls) {
    const controlledElement = document.getElementById(controls);
    if (!controlledElement) {
      errors.push(`aria-controls references non-existent element: ${controls}`);
    }
  }

  // Check required ARIA for roles
  const role = element.getAttribute('role');
  if (role === 'button' && !hasLabel && !hasLabelledBy && !element.textContent?.trim()) {
    warnings.push('Button role requires accessible name (aria-label, aria-labelledby, or text content)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Initialize accessibility enhancements
 */
export function initAccessibilityEnhancements(): void {
  if (typeof window === 'undefined') return;

  // Add skip links
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    const skipLink = createSkipLink('main-content');
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Enhance focus visible
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
}

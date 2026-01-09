/**
 * Animation Utilities
 * 
 * Helper functions for smooth animations and transitions
 */

import { prefersReducedMotion } from '@/lib/accessibility/a11y';

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  respectReducedMotion?: boolean;
}

/**
 * Get animation duration respecting user preferences
 */
export function getAnimationDuration(
  defaultDuration: number,
  options: AnimationOptions = {}
): number {
  const { respectReducedMotion = true } = options;
  
  if (respectReducedMotion && prefersReducedMotion()) {
    return 0;
  }
  
  return options.duration ?? defaultDuration;
}

/**
 * Get CSS transition string
 */
export function getTransition(
  properties: string | string[],
  options: AnimationOptions = {}
): string {
  const duration = getAnimationDuration(300, options);
  const delay = options.delay ?? 0;
  const easing = options.easing ?? 'ease-out';
  
  const props = Array.isArray(properties) ? properties : [properties];
  const transitions = props.map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`);
  
  return transitions.join(', ');
}

/**
 * Stagger animation delays for list items
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

/**
 * Fade in animation
 */
export function fadeIn(options: AnimationOptions = {}): string {
  const duration = getAnimationDuration(400, options);
  const delay = options.delay ?? 0;
  
  return `
    animation: fadeIn ${duration}ms ease-out ${delay}ms forwards;
    opacity: 0;
  `;
}

/**
 * Slide up animation
 */
export function slideUp(options: AnimationOptions = {}): string {
  const duration = getAnimationDuration(400, options);
  const delay = options.delay ?? 0;
  const distance = options.respectReducedMotion && prefersReducedMotion() ? 0 : 20;
  
  return `
    animation: slideUp ${duration}ms ease-out ${delay}ms forwards;
    opacity: 0;
    transform: translateY(${distance}px);
  `;
}

/**
 * Scale in animation
 */
export function scaleIn(options: AnimationOptions = {}): string {
  const duration = getAnimationDuration(300, options);
  const delay = options.delay ?? 0;
  
  return `
    animation: scaleIn ${duration}ms ease-out ${delay}ms forwards;
    opacity: 0;
    transform: scale(0.95);
  `;
}

/**
 * Create CSS keyframes
 */
export function createKeyframes(name: string, keyframes: Record<string, Record<string, string>>): string {
  const frames = Object.entries(keyframes)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ');
      return `${key} { ${styleString} }`;
    })
    .join('\n  ');
  
  return `@keyframes ${name} {\n  ${frames}\n}`;
}

/**
 * Intersection Observer for scroll animations
 */
export function createScrollAnimation(
  element: HTMLElement,
  callback: (isVisible: boolean) => void,
  options: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  } = {}
): () => void {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
        
        if (once && entry.isIntersecting) {
          observer.unobserve(element);
        }
      });
    },
    { threshold, rootMargin }
  );
  
  observer.observe(element);
  
  return () => observer.disconnect();
}

/**
 * Debounce function for animations
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for animations
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Easing functions
 */
export const easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

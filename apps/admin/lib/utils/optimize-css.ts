/**
 * CSS Optimization Utilities
 * Critical CSS and performance optimizations
 */

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof window === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
}

/**
 * Load non-critical CSS asynchronously
 */
export function loadCSS(href: string, media = "all") {
  if (typeof window === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.media = media;
  link.onload = () => {
    link.media = "all";
  };
  document.head.appendChild(link);
}

/**
 * Inline critical CSS
 */
export function inlineCriticalCSS(css: string) {
  if (typeof window === "undefined") return;
  
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Z-Index Scale Utility
 * 
 * Centralized z-index values to prevent conflicts
 * Based on Tailwind's default z-index scale
 */

export const zIndex = {
  // Base layers
  base: 0,
  
  // Content layers
  content: 1,
  contentElevated: 10,
  
  // Overlay layers
  overlay: 20,
  overlayElevated: 30,
  
  // Fixed UI elements
  fixed: 40,
  fixedElevated: 50,
  
  // Modal/Dialog layers
  modal: 100,
  modalOverlay: 90,
  modalContent: 110,
  
  // Toast/Notification layers
  toast: 200,
  
  // Tooltip layers
  tooltip: 300,
  
  // Maximum
  max: 9999,
} as const;

/**
 * Get z-index class name
 */
export function getZIndexClass(level: keyof typeof zIndex): string {
  return `z-${zIndex[level]}`;
}

/**
 * Get z-index value
 */
export function getZIndexValue(level: keyof typeof zIndex): number {
  return zIndex[level];
}

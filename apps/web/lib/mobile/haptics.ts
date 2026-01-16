/**
 * Haptic Feedback Utility
 * Provides native-like haptic feedback for mobile devices
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticPattern {
  pattern: number[];
  repeat?: number;
}

const HAPTIC_PATTERNS: Record<HapticType, HapticPattern> = {
  light: { pattern: [10] },
  medium: { pattern: [20] },
  heavy: { pattern: [30] },
  success: { pattern: [10, 50, 10] },
  warning: { pattern: [20, 50, 20] },
  error: { pattern: [30, 50, 30, 50, 30] },
};

/**
 * Check if device supports haptic feedback
 */
export function supportsHaptics(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Vibration API
  if ('vibrate' in navigator) {
    return true;
  }
  
  // Check for WebKit Haptic API (iOS)
  if ('webkitVibrate' in navigator) {
    return true;
  }
  
  return false;
}

/**
 * Trigger haptic feedback
 * @param type - Type of haptic feedback
 * @param fallback - Whether to use visual feedback as fallback
 */
export function triggerHaptic(
  type: HapticType = 'medium',
  fallback: boolean = true
): void {
  if (typeof window === 'undefined') return;

  const pattern = HAPTIC_PATTERNS[type];
  
  // Try Vibration API first (Android, most browsers)
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern.pattern);
      return;
    } catch (e) {
      console.warn('Vibration API failed:', e);
    }
  }
  
  // Try WebKit Haptic API (iOS Safari)
  if ('webkitVibrate' in navigator) {
    try {
      (navigator as any).webkitVibrate(pattern.pattern);
      return;
    } catch (e) {
      console.warn('WebKit Vibration API failed:', e);
    }
  }
  
  // Fallback: Visual feedback
  if (fallback) {
    // Add a subtle visual feedback class to the body
    document.body.classList.add('haptic-feedback');
    setTimeout(() => {
      document.body.classList.remove('haptic-feedback');
    }, 100);
  }
}

/**
 * Trigger haptic feedback for button press
 */
export function hapticButtonPress(): void {
  triggerHaptic('light');
}

/**
 * Trigger haptic feedback for success action
 */
export function hapticSuccess(): void {
  triggerHaptic('success');
}

/**
 * Trigger haptic feedback for error
 */
export function hapticError(): void {
  triggerHaptic('error');
}

/**
 * Trigger haptic feedback for warning
 */
export function hapticWarning(): void {
  triggerHaptic('warning');
}

/**
 * React hook for haptic feedback
 */
export function useHaptic() {
  return {
    trigger: triggerHaptic,
    buttonPress: hapticButtonPress,
    success: hapticSuccess,
    error: hapticError,
    warning: hapticWarning,
    supports: supportsHaptics(),
  };
}

/**
 * Swipe Gesture Utilities for Admin Panel
 * Handles swipe gestures for mobile interactions
 */

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
}

export interface SwipeConfig {
  threshold?: number; // Minimum distance in pixels
  velocity?: number; // Minimum velocity
  preventDefault?: boolean;
}

const DEFAULT_CONFIG: Required<SwipeConfig> = {
  threshold: 50,
  velocity: 0.3,
  preventDefault: true,
};

export interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  isSwiping: boolean;
}

/**
 * Create swipe gesture handlers
 */
export function createSwipeHandlers(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
): {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
} {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const state: SwipeState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isSwiping: false,
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.currentX = touch.clientX;
    state.currentY = touch.clientY;
    state.startTime = Date.now();
    state.isSwiping = true;

    if (finalConfig.preventDefault) {
      e.preventDefault();
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!state.isSwiping) return;

    const touch = e.touches[0];
    state.currentX = touch.clientX;
    state.currentY = touch.clientY;

    if (finalConfig.preventDefault) {
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (!state.isSwiping) return;

    const deltaX = state.currentX - state.startX;
    const deltaY = state.currentY - state.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - state.startTime;
    const velocity = distance / duration;

    state.isSwiping = false;

    // Check if swipe meets threshold and velocity requirements
    if (distance < finalConfig.threshold || velocity < finalConfig.velocity) {
      return;
    }

    // Determine primary direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    let direction: SwipeDirection | null = null;

    if (absX > absY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
    }

    if (!direction) return;

    // Call appropriate handler
    if (handlers.onSwipe) {
      handlers.onSwipe(direction);
    }

    switch (direction) {
      case 'left':
        handlers.onSwipeLeft?.();
        break;
      case 'right':
        handlers.onSwipeRight?.();
        break;
      case 'up':
        handlers.onSwipeUp?.();
        break;
      case 'down':
        handlers.onSwipeDown?.();
        break;
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

/**
 * React hook for swipe gestures
 */
export function useSwipe(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) {
  return createSwipeHandlers(handlers, config);
}

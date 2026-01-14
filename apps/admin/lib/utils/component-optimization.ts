/**
 * Component Optimization Utilities
 * Helpers for React component optimization
 */

import { memo, ComponentType, ComponentPropsWithoutRef } from "react";

/**
 * Create a memoized component with display name
 */
export function memoizedComponent<T extends ComponentType<any>>(
  Component: T,
  displayName?: string
): T {
  const Memoized = memo(Component) as unknown as T;
  if (displayName) {
    Memoized.displayName = displayName;
  }
  return Memoized;
}

/**
 * Compare props for memoization
 */
export function arePropsEqual<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  keysToCompare?: (keyof T)[]
): boolean {
  if (!keysToCompare) {
    return Object.keys(prevProps).every((key) => prevProps[key] === nextProps[key]);
  }
  return keysToCompare.every((key) => prevProps[key] === nextProps[key]);
}

/**
 * Create a custom memo comparator
 */
export function createMemoComparator<T extends Record<string, any>>(
  keysToCompare?: (keyof T)[]
) {
  return (prevProps: T, nextProps: T) => arePropsEqual(prevProps, nextProps, keysToCompare);
}

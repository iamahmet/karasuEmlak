/**
 * Event Handler Utilities
 * Standardized event handling to prevent propagation issues
 */

import { MouseEvent, KeyboardEvent } from "react";

/**
 * Creates a safe click handler that prevents propagation only when needed
 */
export function createSafeClickHandler(
  handler: () => void,
  options: {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    interactiveSelectors?: string[];
  } = {}
) {
  return (e: MouseEvent | KeyboardEvent) => {
    const { preventDefault = false, stopPropagation = false, interactiveSelectors = [] } = options;

    // Check if click is on an interactive element
    const target = e.target as HTMLElement;
    const isInteractive =
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea") ||
      interactiveSelectors.some((selector) => target.closest(selector));

    // If clicking on interactive element, don't trigger handler
    if (isInteractive) {
      return;
    }

    if (preventDefault) {
      e.preventDefault();
    }

    if (stopPropagation) {
      e.stopPropagation();
    }

    handler();
  };
}

/**
 * Creates a button click handler that always stops propagation
 */
export function createButtonHandler(handler: () => void) {
  return (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  };
}

/**
 * Creates a row click handler that ignores clicks on interactive elements
 */
export function createRowClickHandler(
  handler: (e: MouseEvent) => void,
  interactiveSelectors: string[] = ["button", "a", "input", "select", "textarea", "[role='button']"]
) {
  return (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = interactiveSelectors.some((selector) => target.closest(selector));

    if (!isInteractive) {
      handler(e);
    }
  };
}

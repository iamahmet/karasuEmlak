/**
 * Contrast Checker Utility
 * Calculates WCAG contrast ratios and compliance levels
 */

interface ContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  pass: boolean;
}

/**
 * Calculate contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the relative luminance of the lighter color
 * and L2 is the relative luminance of the darker color
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * Check contrast ratio between foreground and background colors
 * @param foreground - Foreground color in hex format (e.g., "#000000")
 * @param background - Background color in hex format (e.g., "#ffffff")
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Contrast result with ratio, level, and pass status
 */
export function checkContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastResult {
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG standards:
  // - Normal text: AA requires 4.5:1, AAA requires 7:1
  // - Large text: AA requires 3:1, AAA requires 4.5:1
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  let level: 'AA' | 'AAA' | 'fail';
  let pass: boolean;

  if (ratio >= aaaThreshold) {
    level = 'AAA';
    pass = true;
  } else if (ratio >= aaThreshold) {
    level = 'AA';
    pass = true;
  } else {
    level = 'fail';
    pass = false;
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    pass,
  };
}

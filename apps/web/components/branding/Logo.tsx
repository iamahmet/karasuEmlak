"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@karasu-emlak/config";
import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * Logo variant: "full" includes text, "icon" is icon only
   */
  variant?: "full" | "icon";
  /**
   * Size: "sm" | "md" | "lg" | "xl"
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Show as link (default: true)
   */
  href?: string | false;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Hide text on mobile (default: false)
   */
  hideTextOnMobile?: boolean;
  /**
   * Custom logo image path (overrides default)
   */
  logoSrc?: string;
  /**
   * Custom icon path (overrides default)
   */
  iconSrc?: string;
}

const sizeMap = {
  sm: {
    icon: 24,
    text: "text-sm",
    spacing: "space-x-2",
  },
  md: {
    icon: 32,
    text: "text-base",
    spacing: "space-x-2.5",
  },
  lg: {
    icon: 40,
    text: "text-lg",
    spacing: "space-x-3",
  },
  xl: {
    icon: 48,
    text: "text-xl",
    spacing: "space-x-3.5",
  },
};

/**
 * Professional Logo Component
 * 
 * Supports:
 * - SVG and PNG logos
 * - Responsive sizing
 * - Icon-only and full variants
 * - Optimized Next.js Image component
 * - Fallback to inline SVG if image fails
 */
export function Logo({
  variant = "full",
  size = "md",
  href = "/",
  className,
  hideTextOnMobile = false,
  logoSrc,
  iconSrc,
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const sizes = sizeMap[size];
  const logoPath = logoSrc || "/logo.svg";
  const iconPath = iconSrc || "/logo-icon.svg";

  // Calculate logo dimensions based on size
  // Based on provided images: full logo is ~301x73 (4.12:1 aspect ratio)
  // Icon is ~44x40 (1.1:1, nearly square)
  const logoAspectRatio = 4.12; // Full logo aspect ratio from image
  const iconAspectRatio = 1.1; // Icon aspect ratio
  
  // Logo heights - more generous sizing
  const logoHeight = variant === "icon" 
    ? sizes.icon 
    : size === "sm" ? 28 
    : size === "md" ? 40 
    : size === "lg" ? 50 
    : 60;
  const logoWidth = variant === "icon" 
    ? Math.round(logoHeight * iconAspectRatio)
    : Math.round(logoHeight * logoAspectRatio);

  const logoContent = (
    <div
      className={cn(
        "flex items-center group",
        variant === "icon" ? "" : sizes.spacing,
        className
      )}
    >
      {variant === "icon" ? (
        // Icon only variant
        <div className="relative flex-shrink-0">
          {imageError ? (
            <div
              className={cn(
                "rounded-lg bg-primary/10 flex items-center justify-center",
                "transition-transform duration-200 group-hover:scale-105"
              )}
              style={{ width: sizes.icon, height: sizes.icon }}
            >
              <span className="text-primary font-bold text-xs">KE</span>
            </div>
          ) : (
            <Image
              src={iconPath}
              alt={`${siteConfig.name} Logo`}
              width={sizes.icon}
              height={sizes.icon}
              className="transition-transform duration-200 group-hover:scale-105 object-contain"
              priority
              unoptimized={iconPath.endsWith(".svg")}
              onError={() => setImageError(true)}
            />
          )}
        </div>
      ) : (
        // Full logo variant - show the complete logo image
        <div className="relative flex-shrink-0" style={{ minWidth: `${logoWidth}px` }}>
          {imageError ? (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 bg-primary/10",
                "transition-transform duration-200 group-hover:scale-105"
              )}
              style={{ height: `${logoHeight}px` }}
            >
              <span className="text-primary font-bold text-sm">KE</span>
              <span className="text-foreground font-semibold text-sm">{siteConfig.name}</span>
            </div>
          ) : (
            <Image
              src={logoPath}
              alt={`${siteConfig.name} Logo`}
              width={logoWidth}
              height={logoHeight}
              className="transition-transform duration-200 group-hover:scale-105 object-contain"
              priority
              unoptimized={logoPath.endsWith(".svg")}
              onError={() => setImageError(true)}
              style={{
                height: `${logoHeight}px`,
                width: `${logoWidth}px`,
                maxWidth: "none",
              }}
            />
          )}
        </div>
      )}
    </div>
  );

  if (href === false) {
    return logoContent;
  }

  return (
    <Link
      href={href}
      className="flex items-center"
      aria-label={`${siteConfig.name} Ana Sayfa`}
    >
      {logoContent}
    </Link>
  );
}

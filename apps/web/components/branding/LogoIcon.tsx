"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  /**
   * Size in pixels (default: 40)
   */
  size?: number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Custom icon path (overrides default)
   */
  iconSrc?: string;
  /**
   * Alt text
   */
  alt?: string;
}

/**
 * Logo Icon Component (Icon only, no text)
 * 
 * Optimized for favicon, app icons, and small logo displays
 */
export function LogoIcon({
  size = 40,
  className,
  iconSrc = "/logo-icon.svg",
  alt = "Logo",
}: LogoIconProps) {
  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <Image
        src={iconSrc}
        alt={alt}
        width={size}
        height={size}
        className="transition-transform duration-200 hover:scale-105 object-contain"
        priority
        unoptimized={iconSrc.endsWith(".svg")}
      />
    </div>
  );
}

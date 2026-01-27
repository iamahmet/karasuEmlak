/**
 * Get Admin Panel URL
 * Returns the correct admin subdomain URL for magic links and redirects
 */

export function getAdminUrl(path: string = ""): string {
  if (typeof window === "undefined") {
    // Server-side: use environment variable or construct from site URL
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
    if (adminUrl) {
      return `${adminUrl}${path}`;
    }
    
    // Fallback: construct from site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
    if (siteUrl.includes("www.")) {
      return `${siteUrl.replace("www.", "admin.")}${path}`;
    }
    if (siteUrl.includes("karasuemlak.net")) {
      return `https://admin.karasuemlak.net${path}`;
    }
    
    // Development fallback
    return `http://localhost:3001${path}`;
  }

  // Client-side: detect current origin
  const currentOrigin = window.location.origin;
  
  // If already on admin subdomain, return as is
  if (currentOrigin.includes("admin.") || currentOrigin.includes(":3001")) {
    return `${currentOrigin}${path}`;
  }
  
  // If on main domain, convert to admin subdomain
  if (currentOrigin.includes("karasuemlak.net")) {
    return `https://admin.karasuemlak.net${path}`;
  }
  
  // If on Vercel deployment URL, redirect to admin subdomain
  if (currentOrigin.includes("vercel.app")) {
    // Always redirect to admin subdomain, not Vercel URL
    return `https://admin.karasuemlak.net${path}`;
  }
  
  // Development fallback
  return `http://localhost:3001${path}`;
}

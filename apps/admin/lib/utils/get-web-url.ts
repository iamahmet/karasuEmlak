/**
 * Get Web App URL from Admin Panel
 * Removes admin subdomain and returns the correct web app URL
 */

export function getWebUrl(path: string = ""): string {
  if (typeof window === "undefined") {
    // Server-side: use environment variable or default
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
    return `${siteUrl}${path}`;
  }

  // Client-side: detect current origin and convert admin to web
  const currentOrigin = window.location.origin;
  
  // If we're on admin subdomain (admin.karasuemlak.net or localhost:3001)
  if (currentOrigin.includes("admin.") || currentOrigin.includes(":3001")) {
    // Replace admin subdomain with main domain
    const webOrigin = currentOrigin
      .replace("admin.", "")
      .replace(":3001", ":3000")
      .replace("localhost:3001", "localhost:3000");
    return `${webOrigin}${path}`;
  }

  // If already on web domain, return as is
  return `${currentOrigin}${path}`;
}

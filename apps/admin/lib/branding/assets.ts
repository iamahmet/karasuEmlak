export const BRAND_ASSET_VERSION = "20260225c";
export const BRAND_PRIMARY_COLOR = "#3E6FC3";

export function brandAssetUrl(path: string): string {
  if (!path || /^https?:\/\//i.test(path)) {
    return path;
  }

  const [withoutHash, hash = ""] = path.split("#", 2);
  const separator = withoutHash.includes("?") ? "&" : "?";
  return `${withoutHash}${separator}v=${BRAND_ASSET_VERSION}${hash ? `#${hash}` : ""}`;
}

/** Path without query string - for next/image which requires localPatterns match */
export function brandAssetPath(path: string): string {
  if (!path || /^https?:\/\//i.test(path)) {
    return path;
  }
  return path.split("?", 1)[0].split("#", 1)[0];
}

export function isSvgAssetUrl(path: string): boolean {
  return path.split("#", 1)[0].split("?", 1)[0].toLowerCase().endsWith(".svg");
}

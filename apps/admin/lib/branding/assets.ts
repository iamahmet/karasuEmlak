export const BRAND_ASSET_VERSION = "20260225b";
export const BRAND_PRIMARY_COLOR = "#3E6FC3";

export function brandAssetUrl(path: string): string {
  if (!path || /^https?:\/\//i.test(path)) {
    return path;
  }

  const [withoutHash, hash = ""] = path.split("#", 2);
  const separator = withoutHash.includes("?") ? "&" : "?";
  return `${withoutHash}${separator}v=${BRAND_ASSET_VERSION}${hash ? `#${hash}` : ""}`;
}

export function isSvgAssetUrl(path: string): boolean {
  return path.split("#", 1)[0].split("?", 1)[0].toLowerCase().endsWith(".svg");
}

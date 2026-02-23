/**
 * Search Engine Index Notification
 * Pings Google/Bing sitemap + IndexNow for faster indexing
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://www.karasuemlak.net";

/**
 * Ping search engines about sitemap updates
 */
export async function pingSitemap(): Promise<void> {
  const sitemapUrl = `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`;
  const endpoints = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  await Promise.allSettled(
    endpoints.map((url) =>
      fetch(url).catch((err) => {
        console.warn("[index-notify] Sitemap ping failed:", url, err);
      })
    )
  );
}

/**
 * Submit URLs to IndexNow (Bing, Yandex, etc.)
 */
export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  const key = process.env.INDEXNOW_API_KEY;
  if (!key) {
    console.warn("[index-notify] INDEXNOW_API_KEY not set, skipping");
    return false;
  }

  const base = SITE_URL.replace(/\/$/, "");
  const host = new URL(base).hostname;
  const keyLocation = `${base}/${key}.txt`;

  const urlList = urls.map((u) => {
    if (u.startsWith("/")) return `${base}${u}`;
    return u;
  });

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList,
      }),
    });

    if (!res.ok) {
      console.warn("[index-notify] IndexNow failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[index-notify] IndexNow error:", err);
    return false;
  }
}

/**
 * Notify search engines about new/updated URLs
 * Call this when publishing articles
 */
export async function notifySearchEngines(urls: string[]): Promise<{
  sitemapPinged: boolean;
  indexNowSubmitted: boolean;
}> {
  const valid = urls.filter((u) => {
    if (typeof u !== "string") return false;
    if (u.startsWith("/")) return true;
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  });

  if (valid.length === 0) {
    return { sitemapPinged: false, indexNowSubmitted: false };
  }

  await pingSitemap();
  const indexNowOk = await submitToIndexNow(valid);

  return { sitemapPinged: true, indexNowSubmitted: indexNowOk };
}

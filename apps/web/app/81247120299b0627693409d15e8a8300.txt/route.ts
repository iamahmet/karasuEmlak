/**
 * IndexNow Key Verification File
 * Returns the IndexNow API key for search engine verification
 */
export async function GET() {
  const key = process.env.INDEXNOW_API_KEY || "81247120299b0627693409d15e8a8300";
  return new Response(key, {
    headers: { "Content-Type": "text/plain" },
  });
}

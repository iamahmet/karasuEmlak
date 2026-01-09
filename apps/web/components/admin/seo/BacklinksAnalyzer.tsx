'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Link2, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface BacklinkAnalysis {
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority: number;
  pageAuthority: number;
  topBacklinks: Array<{
    sourceUrl: string;
    targetUrl: string;
    anchorText: string;
    domainAuthority?: number;
  }>;
}

export function BacklinksAnalyzer() {
  const [domain, setDomain] = useState('karasuemlak.net');
  const [analysis, setAnalysis] = useState<BacklinkAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    if (!domain.trim()) return;

    setLoading(true);
    try {
      const data = await fetchWithRetry<{ success: boolean; data?: BacklinkAnalysis }>(
        `/api/services/seo/backlinks?domain=${encodeURIComponent(domain)}`
      );

      if (data.success && data.data) {
        setAnalysis(data.data as unknown as BacklinkAnalysis);
      }
    } catch (error) {
      console.error('Backlink analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Backlink Analizi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Domain (örn: karasuemlak.net)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchAnalysis()}
          />
          <Button onClick={fetchAnalysis} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-xs text-gray-500">Toplam Backlink</span>
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.totalBacklinks}
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-xs text-gray-500">Referans Domain</span>
                <p className="text-2xl font-bold text-green-600">
                  {analysis.referringDomains}
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-xs text-gray-500">Domain Authority</span>
                <p className="text-2xl font-bold text-orange-600">
                  {analysis.domainAuthority}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-xs text-gray-500">Page Authority</span>
                <p className="text-2xl font-bold text-purple-600">
                  {analysis.pageAuthority}
                </p>
              </div>
            </div>

            {analysis.topBacklinks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">En İyi Backlinkler</h3>
                <div className="space-y-2">
                  {analysis.topBacklinks.slice(0, 5).map((backlink, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <a
                            href={backlink.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {new URL(backlink.sourceUrl).hostname}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <p className="text-xs text-gray-500 mt-1">
                            Anchor: "{backlink.anchorText}"
                          </p>
                        </div>
                        {backlink.domainAuthority && (
                          <span className="text-xs font-medium text-gray-600">
                            DA: {backlink.domainAuthority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

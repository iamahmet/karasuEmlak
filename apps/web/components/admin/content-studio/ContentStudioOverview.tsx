"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { FileText, Clock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@karasu/ui";
import { useRouter, usePathname } from "@/i18n/routing";

interface ContentStudioOverviewProps {
  draftCount: number;
  reviewCount: number;
  publishedCount: number;
  recentContent: Array<{
    id: string;
    slug: string;
    type: string;
    status: string;
    created_at: string;
  }>;
  locale?: string;
}

export function ContentStudioOverview({
  draftCount,
  reviewCount,
  publishedCount,
  recentContent,
  locale: propLocale,
}: ContentStudioOverviewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = propLocale || pathname?.split("/")[1] || "tr";

  return (
    <div className="space-y-4">
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-modern hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">Drafts</CardTitle>
            <FileText className="h-3.5 w-3.5 text-design-gray dark:text-gray-400" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-design-dark dark:text-white mb-1">{draftCount}</div>
            <p className="text-[10px] md:text-xs text-design-gray dark:text-gray-400 font-ui">Content in draft</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">Review</CardTitle>
            <Clock className="h-3.5 w-3.5 text-design-light" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-design-dark dark:text-white mb-1">{reviewCount}</div>
            <p className="text-[10px] md:text-xs text-design-gray dark:text-gray-400 font-ui">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">Published</CardTitle>
            <CheckCircle2 className="h-3.5 w-3.5 text-design-light" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-design-dark dark:text-white mb-1">{publishedCount}</div>
            <p className="text-[10px] md:text-xs text-design-gray dark:text-gray-400 font-ui">Live content</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Compact */}
      <Card className="card-modern">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <span className="w-0.5 h-5 bg-gradient-to-b from-design-light to-design-dark rounded-full"></span>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap px-4 pb-4">
          <Button 
            onClick={() => {
              router.push(`/${locale}/seo/content-studio?tab=create&type=blog`);
            }}
            className="h-8 px-3 text-xs font-ui bg-design-dark hover:bg-design-dark/90 text-white rounded-lg hover-scale micro-bounce"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Blog Post
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              router.push(`/${locale}/seo/content-studio?tab=create&type=howto`);
            }}
            className="h-8 px-3 text-xs font-ui border border-[#E7E7E7] dark:border-[#062F28] rounded-lg hover-scale"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            How-To
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              router.push(`/${locale}/seo/content-studio?tab=create&type=cornerstone`);
            }}
            className="h-8 px-3 text-xs font-ui border border-[#E7E7E7] dark:border-[#062F28] rounded-lg hover-scale"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Rehber
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              router.push(`/${locale}/seo/content-studio?tab=drafts`);
            }}
            className="h-8 px-3 text-xs font-ui border border-[#E7E7E7] dark:border-[#062F28] rounded-lg hover-scale"
          >
            View Drafts
          </Button>
        </CardContent>
      </Card>

      {/* Recent Content - Compact */}
      {recentContent.length > 0 && (
        <Card className="card-modern">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <span className="w-0.5 h-5 bg-gradient-to-b from-design-light to-design-dark rounded-full"></span>
              Recent Content
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1.5">
              {recentContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 border border-[#E7E7E7] dark:border-[#062F28] rounded-lg cursor-pointer hover:bg-design-light/5 dark:hover:bg-design-light/10 hover:border-design-light/30 transition-all duration-200 hover-scale"
                  onClick={() => {
                    router.push(`/${locale}/seo/content-studio/${item.id}`);
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-medium capitalize text-design-dark dark:text-white font-ui">{item.type}</span>
                    <span className="text-xs text-design-gray dark:text-gray-400 truncate font-ui">{item.slug}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded capitalize font-ui font-semibold ${
                        item.status === "published"
                          ? "bg-design-light/20 text-design-dark dark:text-design-light"
                          : item.status === "review"
                          ? "bg-design-light/15 text-design-dark dark:text-design-light"
                          : "bg-[#E7E7E7] dark:bg-[#062F28] text-design-gray dark:text-gray-400"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] text-design-gray dark:text-gray-400 font-ui">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { CreateTab } from "./CreateTab";
import { DraftsTab } from "./DraftsTab";
import { ReviewTab } from "./ReviewTab";
import { PublishedTab } from "./PublishedTab";
import { KeywordBasedContentGenerator } from "./KeywordBasedContentGenerator";
import { ClusterBuilderTab } from "./ClusterBuilderTab";

interface ContentStudioTabsProps {
  defaultTab?: string;
  locale: string;
  contentType?: string;
}

export function ContentStudioTabs({
  defaultTab = "create",
  locale,
  contentType,
}: ContentStudioTabsProps) {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || defaultTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, activeTab, defaultTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] rounded-lg p-1 flex-wrap h-auto grid w-full grid-cols-5">
        <TabsTrigger 
          value="create" 
          className="text-xs font-ui data-[state=active]:bg-gradient-to-r data-[state=active]:from-design-light data-[state=active]:to-green-600 data-[state=active]:text-white rounded-xl transition-all duration-200 hover-scale micro-bounce"
        >
          Oluştur
        </TabsTrigger>
        <TabsTrigger 
          value="drafts"
          className="text-xs font-ui data-[state=active]:bg-gradient-to-r data-[state=active]:from-design-light data-[state=active]:to-green-600 data-[state=active]:text-white rounded-xl transition-all duration-200 hover-scale micro-bounce"
        >
          Taslaklar
        </TabsTrigger>
        <TabsTrigger 
          value="review"
          className="text-xs font-ui data-[state=active]:bg-gradient-to-r data-[state=active]:from-design-light data-[state=active]:to-green-600 data-[state=active]:text-white rounded-xl transition-all duration-200 hover-scale micro-bounce"
        >
          İnceleme
        </TabsTrigger>
        <TabsTrigger 
          value="published"
          className="text-xs font-ui data-[state=active]:bg-gradient-to-r data-[state=active]:from-design-light data-[state=active]:to-green-600 data-[state=active]:text-white rounded-xl transition-all duration-200 hover-scale micro-bounce"
        >
          Yayınlanan
        </TabsTrigger>
        <TabsTrigger 
          value="clusters"
          className="text-xs font-ui data-[state=active]:bg-gradient-to-r data-[state=active]:from-design-light data-[state=active]:to-green-600 data-[state=active]:text-white rounded-xl transition-all duration-200 hover-scale micro-bounce"
        >
          Kümeler
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="mt-6">
        <CreateTab locale={locale} defaultType={contentType} />
      </TabsContent>

      <TabsContent value="drafts" className="mt-6">
        <DraftsTab locale={locale} />
      </TabsContent>

      <TabsContent value="review" className="mt-6">
        <ReviewTab locale={locale} />
      </TabsContent>

      <TabsContent value="published" className="mt-6">
        <PublishedTab locale={locale} />
      </TabsContent>

      <TabsContent value="clusters" className="mt-6">
        <ClusterBuilderTab locale={locale} />
      </TabsContent>
    </Tabs>
  );
}


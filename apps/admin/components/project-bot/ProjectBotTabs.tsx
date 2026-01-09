"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { FindingsTab } from "./FindingsTab";
import { RecommendationsTab } from "./RecommendationsTab";
import { RunsTab } from "./RunsTab";
import { SettingsTab } from "./SettingsTab";

interface ProjectBotTabsProps {
  defaultTab?: string;
  locale: string;
}

export function ProjectBotTabs({ defaultTab = "findings", locale }: ProjectBotTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="findings">Findings</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        <TabsTrigger value="runs">Runs</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="findings" className="mt-6">
        <FindingsTab locale={locale} />
      </TabsContent>

      <TabsContent value="recommendations" className="mt-6">
        <RecommendationsTab locale={locale} />
      </TabsContent>

      <TabsContent value="runs" className="mt-6">
        <RunsTab locale={locale} />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <SettingsTab locale={locale} />
      </TabsContent>
    </Tabs>
  );
}


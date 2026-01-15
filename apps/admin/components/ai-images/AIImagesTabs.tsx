'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@karasu/ui';
import { 
  BarChart3, 
  Sparkles, 
  FileText, 
  Settings,
} from 'lucide-react';
import { AIImagesDashboard } from './AIImagesDashboard';
import { AIImageGenerator } from './AIImageGenerator';
import { AIImageLogs } from './AIImageLogs';
import { AIImageSettings } from './AIImageSettings';

export function AIImagesTabs({ locale: _locale }: { locale: string }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-card border border-border rounded-lg p-1 flex-wrap h-auto">
        <TabsTrigger value="dashboard" className="text-xs font-ui flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="generate" className="text-xs font-ui flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Görsel Üret
        </TabsTrigger>
        <TabsTrigger value="logs" className="text-xs font-ui flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Loglar
        </TabsTrigger>
        <TabsTrigger value="settings" className="text-xs font-ui flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Ayarlar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <AIImagesDashboard />
      </TabsContent>

      <TabsContent value="generate">
        <AIImageGenerator />
      </TabsContent>

      <TabsContent value="logs">
        <AIImageLogs />
      </TabsContent>

      <TabsContent value="settings">
        <AIImageSettings />
      </TabsContent>
    </Tabs>
  );
}


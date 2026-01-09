import { getTranslations, setRequestLocale } from "next-intl/server";
// import { requireStaff } from "@/lib/admin/auth/server";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/admin/loading/PageSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Settings, Palette, FileText, Database, Code, Shield } from "lucide-react";

const SettingsManagement = dynamic(
  () => import("@/components/admin/settings/SettingsManagement").then((mod) => ({ default: mod.SettingsManagement })),
  {
    loading: () => <PageSkeleton />,
    ssr: true,
  }
);

const SiteCustomization = dynamic(
  () => import("@/components/admin/settings/SiteCustomization").then((mod) => ({ default: mod.SiteCustomization })),
  {
    loading: () => <PageSkeleton />,
  }
);

const StaticPagesEditor = dynamic(
  () => import("@/components/admin/settings/StaticPagesEditor").then((mod) => ({ default: mod.StaticPagesEditor })),
  {
    loading: () => <PageSkeleton />,
  }
);

const ArticlesEditor = dynamic(
  () => import("@/components/admin/articles/ArticlesEditor").then((mod) => ({ default: mod.ArticlesEditor })),
  {
    loading: () => <PageSkeleton />,
  }
);

const BackupRestore = dynamic(
  () => import("@/components/admin/settings/BackupRestore").then((mod) => ({ default: mod.BackupRestore })),
  {
    loading: () => <PageSkeleton />,
  }
);

const AdvancedConfiguration = dynamic(
  () => import("@/components/admin/settings/AdvancedConfiguration").then((mod) => ({ default: mod.AdvancedConfiguration })),
  {
    loading: () => <PageSkeleton />,
  }
);

const SystemHealth = dynamic(
  () => import("@/components/admin/dashboard/SystemHealth").then((mod) => ({ default: mod.SystemHealth })),
  {
    loading: () => <PageSkeleton />,
    ssr: true,
  }
);

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  
  // Development mode: Skip auth check
  // In production, uncomment the line below to enable role checking
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "settings" });

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      {/* Header - Enhanced Modern */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-design-gray dark:text-gray-400 text-sm md:text-base font-body font-medium">
            {t("description")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] rounded-lg p-1 flex-wrap h-auto">
          <TabsTrigger value="general" className="text-xs font-ui flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Genel Ayarlar
          </TabsTrigger>
          <TabsTrigger value="customization" className="text-xs font-ui flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Site Özelleştirme
          </TabsTrigger>
          <TabsTrigger value="pages" className="text-xs font-ui flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Statik Sayfalar
          </TabsTrigger>
          <TabsTrigger value="articles" className="text-xs font-ui flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Haberler
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs font-ui flex items-center gap-2">
            <Code className="h-4 w-4" />
            Gelişmiş
          </TabsTrigger>
          <TabsTrigger value="backup" className="text-xs font-ui flex items-center gap-2">
            <Database className="h-4 w-4" />
            Yedekleme
          </TabsTrigger>
          <TabsTrigger value="health" className="text-xs font-ui flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sistem Sağlığı
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsManagement locale={locale} />
        </TabsContent>

        <TabsContent value="customization">
          <SiteCustomization locale={locale} />
        </TabsContent>

        <TabsContent value="pages">
          <StaticPagesEditor locale={locale} />
        </TabsContent>

        <TabsContent value="articles">
          <ArticlesEditor locale={locale} />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedConfiguration />
        </TabsContent>

        <TabsContent value="backup">
          <BackupRestore />
        </TabsContent>

        <TabsContent value="health">
          <SystemHealth />
        </TabsContent>
      </Tabs>
    </div>
  );
}


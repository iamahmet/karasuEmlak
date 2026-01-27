"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { CheckCircle2, AlertCircle, Save, Send } from "lucide-react";
import { useRouter } from "../../i18n/routing";
import { toast } from "sonner";
import { ContentPreview } from "./ContentPreview";
import { AutoSave } from "./AutoSave";
import { ContentKeyboardShortcuts } from "./KeyboardShortcuts";
import { ImageUpload } from "./ImageUpload";
import { MediaLibraryButton } from "./MediaLibraryButton";

interface ContentEditorProps {
  contentItem: any;
  locales: any[];
  qualityScores: any[];
  currentLocale: string;
}

export function ContentEditor({
  contentItem,
  locales,
  qualityScores,
  currentLocale,
}: ContentEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeLocale, setActiveLocale] = useState(currentLocale);
  const [content, setContent] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(
    contentItem.featured_image_url
  );

  useEffect(() => {
    const localeContent = locales.find((l) => l.locale === activeLocale);
    setContent(localeContent || {
      locale: activeLocale,
      title: "",
      content: "",
      excerpt: "",
      meta_title: "",
      meta_description: "",
    });
    setIsDirty(false);
  }, [activeLocale, locales]);

  const handleContentChange = (field: string, value: string) => {
    setContent({ ...content, [field]: value });
    setIsDirty(true);
  };

  const handleAutoSave = async () => {
    if (!isDirty) return;
    await handleSave(true); // Silent save
  };

  const handleSave = async (silent = false) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/content-studio/${contentItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: activeLocale,
          ...content,
          featured_image_url: featuredImage,
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setIsDirty(false);
        if (!silent) {
          toast.success("İçerik kaydedildi");
        }
        router.refresh();
      } else {
        if (!silent) {
          toast.error(data.message || data.error || "Kaydetme başarısız");
        }
      }
    } catch (error: any) {
      if (!silent) {
        toast.error(error.message || "Kaydetme başarısız");
      }
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!passed) {
      toast.error("Please fix quality issues before publishing");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/content-studio/${contentItem.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: activeLocale }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        toast.success("Content published successfully!");
        router.refresh();
      } else {
        toast.error(data.message || data.error || "Failed to publish content");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to publish content");
      // Publish failed, error already shown via toast
    } finally {
      setSaving(false);
    }
  };

  const qualityScore = qualityScores.find((q) => q.locale === activeLocale);
  const passed = qualityScore?.passed || false;
  const score = qualityScore?.score || 0;

  if (!content) {
    return <div>Loading...</div>;
  }

  const localeContent = locales.find((l) => l.locale === activeLocale);

  return (
    <div className="space-y-6">
      {/* Keyboard Shortcuts */}
      <ContentKeyboardShortcuts
        onSave={() => handleSave()}
        onPublish={handlePublish}
        onPreview={() => {
          // Preview will be triggered by button
        }}
        enabled={true}
      />

      {/* Auto Save Indicator */}
      <div className="flex items-center justify-between">
        <AutoSave onSave={handleAutoSave} isDirty={isDirty} />
      </div>

      {/* Quality Gate */}
      {qualityScore && (
        <Card className={passed ? "border-green-500" : "border-yellow-500"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {passed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Quality Gate: {score.toFixed(1)}/100
              {passed ? " ✅ Passed" : " ⚠️ Needs Improvement"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {qualityScore.issues && qualityScore.issues.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Issues:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {(qualityScore.issues as string[]).map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Locale Tabs */}
      <Tabs value={activeLocale} onValueChange={setActiveLocale}>
        <TabsList>
          {["tr", "en", "et", "ru", "ar"].map((loc) => (
            <TabsTrigger key={loc} value={loc}>
              {loc.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeLocale} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content ({activeLocale.toUpperCase()})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={content.title || ""}
                  onChange={(e) => handleContentChange("title", e.target.value)}
                  className="input-modern"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="featured-image">Öne Çıkan Görsel</Label>
                  <MediaLibraryButton
                    onSelect={(url) => {
                      setFeaturedImage(url);
                      setIsDirty(true);
                    }}
                    className="h-8 px-3 text-xs border border-border/40 dark:border-border/40 rounded-lg font-ui hover-scale"
                  />
                </div>
                <ImageUpload
                  currentImage={featuredImage}
                  onUpload={(url) => {
                    setFeaturedImage(url);
                    setIsDirty(true);
                  }}
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  value={content.excerpt || ""}
                  onChange={(e) => handleContentChange("excerpt", e.target.value)}
                  rows={3}
                  className="input-modern"
                />
              </div>

              <div>
                <Label htmlFor="content">İçerik</Label>
                <Textarea
                  id="content"
                  value={content.content || ""}
                  onChange={(e) => handleContentChange("content", e.target.value)}
                  rows={15}
                  className="font-mono text-sm input-modern"
                  placeholder="HTML içerik buraya..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meta_title">Meta Başlık</Label>
                  <Input
                    id="meta_title"
                    value={content.meta_title || ""}
                    onChange={(e) => handleContentChange("meta_title", e.target.value)}
                    className="input-modern"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Açıklama</Label>
                  <Textarea
                    id="meta_description"
                    value={content.meta_description || ""}
                    onChange={(e) => handleContentChange("meta_description", e.target.value)}
                    rows={2}
                    className="input-modern"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {localeContent && (
            <ContentPreview
              content={{
                title: content.title || localeContent.title || "",
                content: content.content || localeContent.content || "",
                excerpt: content.excerpt || localeContent.excerpt,
                metaDescription: content.meta_description || localeContent.meta_description,
                featuredImage: featuredImage || contentItem.featured_image_url,
                locale: activeLocale,
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={saving || !isDirty}
            className="border border-border/40 dark:border-border/40 rounded-xl hover-scale"
          >
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
          <Button
            onClick={handlePublish}
            disabled={!passed || saving}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
          >
            <Send className="h-4 w-4 mr-2" />
            Yayınla
          </Button>
        </div>
      </div>
    </div>
  );
}


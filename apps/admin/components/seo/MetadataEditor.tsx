"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Badge } from "@karasu/ui";
import { Save, Eye, ExternalLink, Edit2, X, Check } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface MetadataEditorProps {
  items: any[];
  type: string;
  locale: string;
}

export function MetadataEditor({ items, type, locale }: MetadataEditorProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItems, setEditedItems] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditedItems({
      [item.id]: {
        meta_title: item.meta_title || item.title || "",
        meta_description: item.meta_description || "",
        canonical_url: item.canonical_url || "",
      },
    });
  };

  const handleSave = async (itemId: string) => {
    setSaving(true);
    try {
      const edited = editedItems[itemId];
      const table = type === "articles" ? "articles" : "content_items";

      const response = await fetch(`/api/seo/metadata/${table}/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_title: edited.meta_title,
          meta_description: edited.meta_description,
          canonical_url: edited.canonical_url,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success("Metadata başarıyla güncellendi");
        setEditingId(null);
        router.refresh();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error: any) {
      toast.error(error.message || "Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (itemId: string, field: string, value: string) => {
    setEditedItems({
      ...editedItems,
      [itemId]: {
        ...editedItems[itemId],
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isEditing = editingId === item.id;
        const edited = editedItems[item.id] || {};
        const displayTitle = item.title || item.slug || item.id;
        const metaTitle = isEditing ? edited.meta_title : item.meta_title || displayTitle;
        const metaDescription = isEditing ? edited.meta_description : item.meta_description || "";
        const canonicalUrl = isEditing ? edited.canonical_url : item.canonical_url || "";

        return (
          <Card key={item.id} className="card-professional hover-lift">
            <CardHeader className="pb-4 px-5 pt-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-display font-bold text-foreground mb-2">
                    {displayTitle}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-ui">{item.slug || item.id}</p>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="hover-scale micro-bounce rounded-xl"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-xs font-ui font-semibold text-foreground mb-2 block">
                      Meta Title
                    </label>
                    <Input
                      value={metaTitle}
                      onChange={(e) => handleChange(item.id, "meta_title", e.target.value)}
                      placeholder="Meta title..."
                      maxLength={60}
                      className="input-modern"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground font-ui">
                        {metaTitle.length}/60 karakter
                      </p>
                      {metaTitle.length >= 30 && metaTitle.length <= 60 && (
                        <Badge className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <Check className="h-3 w-3 mr-1" />
                          Optimal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-ui font-semibold text-foreground mb-2 block">
                      Meta Description
                    </label>
                    <Textarea
                      value={metaDescription}
                      onChange={(e) => handleChange(item.id, "meta_description", e.target.value)}
                      placeholder="Meta description..."
                      rows={3}
                      maxLength={160}
                      className="input-modern"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground font-ui">
                        {metaDescription.length}/160 karakter
                      </p>
                      {metaDescription.length >= 120 && metaDescription.length <= 160 && (
                        <Badge className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <Check className="h-3 w-3 mr-1" />
                          Optimal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-ui font-semibold text-foreground mb-2 block">
                      Canonical URL
                    </label>
                    <Input
                      value={canonicalUrl}
                      onChange={(e) => handleChange(item.id, "canonical_url", e.target.value)}
                      placeholder="https://example.com/page"
                      className="input-modern"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleSave(item.id)}
                      disabled={saving}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditedItems({});
                      }}
                      className="hover-scale micro-bounce rounded-xl"
                    >
                      <X className="h-4 w-4 mr-2" />
                      İptal
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-ui font-semibold text-muted-foreground mb-1 block">
                      Meta Title
                    </label>
                    <p className="text-sm font-ui text-foreground mt-1">
                      {metaTitle || (
                        <span className="text-muted-foreground italic">Belirtilmemiş</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-ui font-semibold text-muted-foreground mb-1 block">
                      Meta Description
                    </label>
                    <p className="text-sm font-ui text-foreground mt-1">
                      {metaDescription || (
                        <span className="text-muted-foreground italic">Belirtilmemiş</span>
                      )}
                    </p>
                  </div>
                  {canonicalUrl && (
                    <div>
                      <label className="text-xs font-ui font-semibold text-muted-foreground mb-1 block">
                        Canonical URL
                      </label>
                      <a
                        href={canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-foreground font-ui hover:underline flex items-center gap-1 mt-1 transition-colors duration-200"
                      >
                        {canonicalUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


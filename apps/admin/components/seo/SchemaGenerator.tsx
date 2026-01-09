"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Badge } from "@karasu/ui";
import { Code, Copy, Check, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateSchemaSuggestions } from "@karasu/lib/openai";
import { generateArticleStructuredData } from "@karasu/lib/seo/metadata";
import { cn } from "@karasu/lib";

interface SchemaGeneratorProps {
  items: any[];
  locale: string;
}

export function SchemaGenerator({ items, locale }: SchemaGeneratorProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async (item: any) => {
    setGenerating(item.id);
    try {
      // First try AI generation
      const aiSchema = await generateSchemaSuggestions({
        title: item.title,
        content: item.content || item.excerpt || "",
        author: item.author,
        publishedAt: item.created_at,
        image: item.featured_image,
      });

      // Fallback to standard generation
      const standardSchema = generateArticleStructuredData({
        title: item.title,
        excerpt: item.excerpt,
        description: item.excerpt,
        image: item.featured_image,
        author: item.author,
        publishedAt: item.created_at,
        modifiedAt: item.updated_at,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${locale}/blog/${item.slug}`,
      });

      const finalSchema = Object.keys(aiSchema).length > 0 ? aiSchema : standardSchema;
      
      setSchemas({
        ...schemas,
        [item.id]: finalSchema,
      });

      toast.success("Schema oluşturuldu");
    } catch (error: any) {
      // Fallback to standard generation
      const standardSchema = generateArticleStructuredData({
        title: item.title,
        excerpt: item.excerpt,
        description: item.excerpt,
        image: item.featured_image,
        author: item.author,
        publishedAt: item.created_at,
        modifiedAt: item.updated_at,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${locale}/blog/${item.slug}`,
      });

      setSchemas({
        ...schemas,
        [item.id]: standardSchema,
      });

      toast.success("Schema oluşturuldu (standart schema kullanıldı)");
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = async (itemId: string) => {
    const schema = schemas[itemId];
    if (schema) {
      await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
      setCopied(itemId);
      setTimeout(() => setCopied(null), 2000);
      toast.success("Schema JSON kopyalandı");
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const schema = schemas[item.id];
        const isGenerating = generating === item.id;
        const isCopied = copied === item.id;

        return (
          <Card key={item.id} className="card-professional hover-lift">
            <CardHeader className="pb-4 px-5 pt-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white mb-2">
                    {item.title}
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-ui">
                      {item.slug}
                    </Badge>
                    {item.category && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-ui bg-design-light/10 text-design-dark dark:text-white">
                        {item.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
                {!schema && (
                  <Button
                    onClick={() => handleGenerate(item)}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-design-light to-green-600 hover:from-design-dark hover:to-green-700 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Schema Oluştur
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            {schema && (
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-ui font-semibold text-design-dark dark:text-white">
                      JSON-LD Schema
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(item.id)}
                      className="hover-scale micro-bounce rounded-xl"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Kopyala
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={JSON.stringify(schema, null, 2)}
                    readOnly
                    rows={15}
                    className="font-mono text-xs bg-[#0a3d35] dark:bg-[#062F28] text-white border-[#062F28] dark:border-[#062F28] rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleGenerate(item)}
                    className="hover-scale micro-bounce rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Yeniden Oluştur
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newSchemas = { ...schemas };
                      delete newSchemas[item.id];
                      setSchemas(newSchemas);
                    }}
                    className="hover-scale micro-bounce rounded-xl"
                  >
                    Temizle
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}


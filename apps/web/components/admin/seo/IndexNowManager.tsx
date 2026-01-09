"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@karasu/ui";
import { Send, RefreshCw, Check, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@karasu/lib/supabase/client";

interface IndexNowManagerProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    updated_at: string;
  }>;
  locale: string;
}

export function IndexNowManager({ articles, locale }: IndexNowManagerProps) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const handleSubmit = async (article: any) => {
    setSubmitting(article.id);
    try {
      const response = await fetch("/api/seo/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: [`/${locale}/haber/${article.slug}`],
        }),
      });

      if (response.ok) {
        setSubmitted(new Set([...submitted, article.id]));
        toast.success("URL IndexNow'a gönderildi");
      } else {
        throw new Error("Submission failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Gönderim başarısız");
    } finally {
      setSubmitting(null);
    }
  };

  const handleBulkSubmit = async () => {
    setSubmitting("bulk");
    try {
      const urls = articles.map((a) => `/${locale}/haber/${a.slug}`);
      const response = await fetch("/api/seo/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      if (response.ok) {
        setSubmitted(new Set(articles.map((a) => a.id)));
        toast.success(`${articles.length} URL IndexNow'a gönderildi`);
      } else {
        throw new Error("Bulk submission failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Toplu gönderim başarısız");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">IndexNow Gönderimi</h3>
          <p className="text-sm text-muted-foreground">
            URL'leri arama motorlarına anında bildirin
          </p>
        </div>
        <Button
          onClick={handleBulkSubmit}
          disabled={submitting === "bulk"}
          className="hover-scale"
        >
          {submitting === "bulk" ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Tümünü Gönder
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        {articles.map((article) => {
          const isSubmitting = submitting === article.id;
          const isSubmitted = submitted.has(article.id);

          return (
            <Card
              key={article.id}
              className="card-professional hover-lift transition-all"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-sm">{article.title}</p>
                      {isSubmitted && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Gönderildi
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{article.slug}</span>
                      <span>
                        Güncellendi: {new Date(article.updated_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/${locale}/haber/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                    <Button
                      size="sm"
                      onClick={() => handleSubmit(article)}
                      disabled={isSubmitting || isSubmitted}
                      variant={isSubmitted ? "outline" : "default"}
                      className="hover-scale"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : isSubmitted ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Gönderildi
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Gönder
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


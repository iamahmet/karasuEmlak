"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@karasu/ui";
import { Link2, Sparkles, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateText } from "@karasu/lib/openai";
import { createClient } from "@karasu/lib/supabase/client";
import { cn } from "@karasu/lib";

interface InternalLinksManagerProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
  }>;
  targetArticle: any;
  locale: string;
}

export function InternalLinksManager({
  articles,
  targetArticle,
  locale,
}: InternalLinksManagerProps) {
  const [selectedArticle, setSelectedArticle] = useState(targetArticle || articles[0]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [appliedLinks, setAppliedLinks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedArticle) {
      generateSuggestions();
    }
  }, [selectedArticle]);

  const generateSuggestions = async () => {
    if (!selectedArticle) return;

    setGenerating(true);
    try {
      const content = selectedArticle.content || selectedArticle.excerpt || "";
      const otherArticles = articles.filter(a => a.id !== selectedArticle.id);

      // Generate internal link suggestions using OpenAI
      const articlesList = otherArticles.map(a => `- ${a.title} (slug: ${a.slug})`).join('\n');
      const prompt = `Analyze this article content and suggest 3-5 relevant internal links to other articles.

Article Content:
${content.substring(0, 1000)}

Available Articles:
${articlesList}

For each suggestion, provide:
- anchor: The text that should be linked (2-5 words from the content)
- targetSlug: The slug of the target article
- context: The sentence or phrase where the link should be placed (20-30 words)

Return as JSON array:
[
  {
    "anchor": "...",
    "targetSlug": "...",
    "context": "..."
  }
]`;

      const response = await generateText(prompt, {
        max_tokens: 500,
        temperature: 0.7,
      });

      try {
        const parsed = JSON.parse(response);
        setSuggestions(Array.isArray(parsed) ? parsed : []);
      } catch {
        // Fallback: create simple suggestions based on keyword matching
        const suggestions = otherArticles.slice(0, 3).map(article => ({
          anchor: article.title.split(' ').slice(0, 3).join(' '),
          targetSlug: article.slug,
          context: content.substring(0, 100) + '...',
        }));
        setSuggestions(suggestions);
      }
    } catch (error: any) {
      toast.error(error.message || "Link önerileri oluşturulamadı");
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyLink = async (suggestion: any) => {
    try {
      const supabase = createClient();
      
      // Save to internal_link_map table
      const { error } = await supabase.from("internal_link_map").insert({
        source_content_id: selectedArticle.id,
        target_slug: suggestion.targetSlug,
        anchor_text: suggestion.anchor,
        context: suggestion.context,
      });

      if (error) throw error;

      setAppliedLinks({
        ...appliedLinks,
        [suggestion.anchor]: true,
      });

      toast.success("Link eklendi");
    } catch (error: any) {
      toast.error(error.message || "Link eklenemedi");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Article Selector */}
      <div className="lg:col-span-1">
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-foreground">
              Makale Seç
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2 max-h-[600px] overflow-y-auto">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all hover-lift micro-bounce",
                  selectedArticle?.id === article.id
                    ? "border-design-light bg-gradient-to-r from-design-light/20 to-design-light/10 dark:from-design-light/10 dark:to-design-light/5"
                    : "border-border hover:border-design-light/40 bg-card"
                )}
              >
                <p className="font-semibold text-sm font-ui text-foreground line-clamp-2">
                  {article.title}
                </p>
                <p className="text-xs text-muted-foreground font-ui mt-1">
                  {article.slug}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      <div className="lg:col-span-2">
        {selectedArticle && (
          <Card className="card-professional">
            <CardHeader className="pb-4 px-5 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-display font-bold text-foreground mb-2">
                    {selectedArticle.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-ui">
                    {selectedArticle.slug}
                  </p>
                </div>
                <Button
                  onClick={generateSuggestions}
                  disabled={generating}
                  className="bg-gradient-to-r from-design-light to-green-600 hover:from-design-dark hover:to-green-700 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
                >
                  {generating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Önerileri Yenile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-xl hover:border-design-light/40 transition-all bg-card hover-lift"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-ui">
                              "{suggestion.anchor}"
                            </Badge>
                            <span className="text-xs text-muted-foreground">→</span>
                            <a
                              href={`/${locale}/haber/${suggestion.targetSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:text-foreground font-ui hover:underline flex items-center gap-1 transition-colors duration-200"
                            >
                              {suggestion.targetSlug}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <p className="text-sm text-muted-foreground italic font-ui">
                            "{suggestion.context}"
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={appliedLinks[suggestion.anchor] ? "outline" : "default"}
                          onClick={() => handleApplyLink(suggestion)}
                          disabled={appliedLinks[suggestion.anchor]}
                          className={cn(
                            "hover-scale micro-bounce rounded-xl",
                            appliedLinks[suggestion.anchor]
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-gradient-to-r from-design-light to-green-600 hover:from-design-dark hover:to-green-700 text-white"
                          )}
                        >
                          {appliedLinks[suggestion.anchor] ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Eklendi
                            </>
                          ) : (
                            <>
                              <Link2 className="h-4 w-4 mr-2" />
                              Ekle
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-ui">
                    {generating
                      ? "Link önerileri analiz ediliyor..."
                      : "Önerileri görmek için yukarıdaki butona tıklayın"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


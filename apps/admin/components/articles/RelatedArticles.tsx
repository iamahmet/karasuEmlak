"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Search, Plus, X, Link2, ExternalLink } from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";
import { toast } from "sonner";

interface RelatedArticlesProps {
  articleId: string;
  currentCategoryId?: string | null;
  onArticlesChange?: (articleIds: string[]) => void;
  className?: string;
}

export function RelatedArticles({ 
  articleId, 
  currentCategoryId,
  onArticlesChange,
  className 
}: RelatedArticlesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRelatedArticles();
  }, [articleId]);

  const fetchRelatedArticles = async () => {
    try {
      const supabase = createClient();
      // Fetch related articles from database (you might have a related_articles table)
      // For now, we'll fetch from the same category
      if (currentCategoryId) {
        const { data } = await supabase
          .from("articles")
          .select("id, title, slug, created_at")
          .eq("category_id", currentCategoryId)
          .neq("id", articleId)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (data) {
          setSelectedArticles(data);
          onArticlesChange?.(data.map((a: any) => a.id));
        }
      }
    } catch (error) {
      console.error("Failed to fetch related articles:", error);
    }
  };

  const searchArticles = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, created_at, category:categories(name)")
        .ilike("title", `%${query}%`)
        .neq("id", articleId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error("Arama yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  const addArticle = (article: any) => {
    if (selectedArticles.find(a => a.id === article.id)) {
      toast.info("Bu haber zaten ekli");
      return;
    }
    setSelectedArticles([...selectedArticles, article]);
    onArticlesChange?.([...selectedArticles, article].map(a => a.id));
    setSearchQuery("");
    setSearchResults([]);
    toast.success("Haber eklendi");
  };

  const removeArticle = (id: string) => {
    setSelectedArticles(selectedArticles.filter(a => a.id !== id));
    onArticlesChange?.(selectedArticles.filter(a => a.id !== id).map(a => a.id));
    toast.success("Haber kaldırıldı");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-display font-bold text-foreground">
          İlgili Haberler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchArticles(e.target.value);
            }}
            placeholder="Haber ara..."
            className="pl-9"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {searchResults.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{article.title}</p>
                  {article.category && (
                    <p className="text-xs text-gray-500">{article.category.name}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addArticle(article)}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Selected Articles */}
        {selectedArticles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Seçili Haberler ({selectedArticles.length})
            </p>
            {selectedArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{article.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const baseUrl = typeof window !== "undefined" 
                          ? window.location.origin.replace(":3001", ":3000")
                          : "http://localhost:3000";
                        const url = `${baseUrl}/tr/haber/${article.slug}`;
                        window.open(url, "_blank");
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Görüntüle
                    </button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeArticle(article.id)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {selectedArticles.length === 0 && searchResults.length === 0 && (
          <p className="text-sm text-center text-gray-400 py-4">
            İlgili haber eklemek için yukarıda arama yapın
          </p>
        )}
      </CardContent>
    </Card>
  );
}


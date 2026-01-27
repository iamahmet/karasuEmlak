"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { safeJsonParse } from "@/lib/utils/safeJsonParse";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@karasu/ui";
import {
  FileText,
  Search,
  Bot,
  BarChart3,
  Shield,
  Settings,
  User,
  Clock,
  Tag,
} from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: "article" | "category" | "user" | "page";
  title: string;
  description?: string;
  url: string;
  icon: any;
  metadata?: Record<string, any>;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "tr";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("admin-recent-searches");
    if (stored) {
      const parsed = safeJsonParse(stored, [], {
        context: "admin-recent-searches",
        dedupeKey: "admin-recent-searches",
      });
      setRecentSearches(Array.isArray(parsed) ? parsed : []);
    }
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const searchResults: SearchResult[] = [];

        // Search articles
        const { data: articles } = await supabase
          .from("articles")
          .select("id, title, slug, excerpt, created_at, status")
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
          .limit(5);

        if (articles) {
          articles.forEach((article: any) => {
            searchResults.push({
              id: article.id,
              type: "article",
              title: article.title,
              description: article.excerpt || `Created ${new Date(article.created_at).toLocaleDateString()}`,
              url: `/${locale}/seo/content-studio/${article.id}`,
              icon: FileText,
              metadata: {
                published: article.status === 'published',
                slug: article.slug,
              },
            });
          });
        }

        // Search categories
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name, slug, description")
          .ilike("name", `%${query}%`)
          .limit(3);

        if (categories) {
          categories.forEach((category: any) => {
            searchResults.push({
              id: category.id,
              type: "category",
              title: category.name,
              description: category.description || `Category: ${category.slug}`,
              url: `/${locale}/categories/${category.slug}`,
              icon: Tag,
              metadata: {
                slug: category.slug,
              },
            });
          });
        }

        // Search users (profiles)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email, created_at")
          .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(3);

        if (profiles) {
          profiles.forEach((profile: any) => {
            searchResults.push({
              id: profile.id,
              type: "user",
              title: profile.name || profile.email,
              description: profile.email,
              url: `/${locale}/users/${profile.id}`,
              icon: User,
              metadata: {
                email: profile.email,
              },
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, locale]);

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("admin-recent-searches", JSON.stringify(updated));

    router.push(result.url);
    onOpenChange(false);
    setQuery("");
  };

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((result) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });
    return groups;
  }, [results]);

  const typeLabels: Record<string, string> = {
    article: "Articles",
    category: "Categories",
    user: "Users",
    page: "Pages",
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search articles, categories, users..."
        value={query}
        onValueChange={setQuery}
        className="h-12 text-sm font-ui"
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm text-design-gray dark:text-gray-400 font-ui">
            Searching...
          </div>
        )}
        {!loading && query.length < 2 && (
          <div className="py-6 px-4">
            <div className="text-xs text-design-gray dark:text-gray-400 mb-2 font-ui uppercase tracking-wider">
              Recent Searches
            </div>
            {recentSearches.length > 0 ? (
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 cursor-pointer"
                    onClick={() => setQuery(search)}
                  >
                    <Clock className="h-3 w-3 text-design-gray dark:text-gray-400" />
                    <span className="text-sm font-ui text-design-gray dark:text-gray-400">{search}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-design-gray dark:text-gray-400 font-ui">
                No recent searches
              </div>
            )}
          </div>
        )}
        {!loading && query.length >= 2 && results.length === 0 && (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        )}
        {!loading && results.length > 0 && (
          <>
            {Object.entries(groupedResults).map(([type, items]) => {
              const Icon = items[0]?.icon || Search;
              return (
                <CommandGroup key={type} heading={typeLabels[type] || type}>
                  {items.map((result) => {
                    const ResultIcon = result.icon;
                    return (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-design-light/10 dark:hover:bg-design-light/5 rounded-lg transition-colors"
                      >
                        <ResultIcon className="h-4 w-4 text-design-gray dark:text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-design-dark dark:text-white font-ui truncate">
                            {result.title}
                          </div>
                          {result.description && (
                            <div className="text-xs text-design-gray dark:text-gray-400 font-ui truncate">
                              {result.description}
                            </div>
                          )}
                        </div>
                        {result.metadata?.published !== undefined && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-ui font-semibold ${
                              result.metadata.published
                                ? "bg-design-light/20 text-design-dark dark:text-design-light"
                                : "bg-[#E7E7E7] dark:bg-[#062F28] text-design-gray dark:text-gray-400"
                            }`}
                          >
                            {result.metadata.published ? "Published" : "Draft"}
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </>
        )}
      </CommandList>
      <div className="border-t border-[#E7E7E7] dark:border-[#062F28] px-3 py-2">
        <div className="flex items-center justify-between text-xs text-design-gray dark:text-gray-400">
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-[#E7E7E7] dark:bg-[#062F28] rounded text-xs font-mono">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-[#E7E7E7] dark:bg-[#062F28] rounded text-xs font-mono">
              Enter
            </kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-[#E7E7E7] dark:bg-[#062F28] rounded text-xs font-mono">
              Esc
            </kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
}


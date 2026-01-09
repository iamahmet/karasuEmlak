"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@karasu/lib/supabase/client";
import { cn } from "@karasu/lib";

interface Keyword {
  id: string;
  keyword: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  lastChecked: string;
}

export function KeywordTracker({ locale }: { locale: string }) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const response = await fetch("/api/seo/keywords");
      if (!response.ok) {
        throw new Error("Keyword'ler yüklenemedi");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Geçersiz response formatı");
      }

      setKeywords(data.keywords || []);
    } catch (error) {
      console.error("Failed to fetch keywords:", error);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error("Lütfen bir keyword girin");
      return;
    }

    setAdding(true);
    try {
      const response = await fetch("/api/seo/keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: newKeyword.trim() }),
      });

      if (!response.ok) {
        throw new Error("Keyword eklenemedi");
      }

      const data = await response.json();
      
      if (!data.success || !data.keyword) {
        throw new Error("Keyword eklenemedi");
      }

      setKeywords([...keywords, data.keyword]);
      setNewKeyword("");
      toast.success("Keyword eklendi");
    } catch (error: any) {
      toast.error(error.message || "Keyword eklenemedi");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveKeyword = async (id: string) => {
    try {
      const response = await fetch(`/api/seo/keywords?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setKeywords(keywords.filter((k) => k.id !== id));
        toast.success("Keyword kaldırıldı");
      } else {
        throw new Error("Keyword kaldırılamadı");
      }
    } catch (error: any) {
      toast.error(error.message || "Keyword kaldırılamadı");
    }
  };

  const getPositionChange = (position: number, previousPosition: number) => {
    const change = previousPosition - position;
    if (change > 0) return { value: change, positive: true };
    if (change < 0) return { value: Math.abs(change), positive: false };
    return { value: 0, positive: null };
  };

  return (
    <div className="space-y-6">
      {/* Add Keyword */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-design-light" />
            Keyword Takibi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Örn: karasu emlak"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
            />
            <Button
              onClick={handleAddKeyword}
              disabled={adding || !newKeyword.trim()}
              className="bg-design-light hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ekle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keywords List */}
      {keywords.length === 0 ? (
        <Card className="card-professional">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-design-gray dark:text-gray-400 opacity-50" />
            <p className="text-design-gray dark:text-gray-400 font-ui">
              Henüz keyword eklenmemiş
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {keywords.map((keyword) => {
            const positionChange = getPositionChange(keyword.position, keyword.previousPosition);
            return (
              <Card key={keyword.id} className="card-professional hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-design-dark dark:text-white font-ui">
                          {keyword.keyword}
                        </h4>
                        <Badge className="bg-design-light/20 text-design-dark dark:text-design-light">
                          Pozisyon: {keyword.position}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                            Pozisyon Değişimi
                          </p>
                          <div className="flex items-center gap-2">
                            {positionChange.positive === true ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-bold text-green-600">
                                  +{positionChange.value}
                                </span>
                              </>
                            ) : positionChange.positive === false ? (
                              <>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-bold text-red-600">
                                  -{positionChange.value}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-design-gray dark:text-gray-400">
                                Değişmedi
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                            Arama Hacmi
                          </p>
                          <p className="text-sm font-bold text-design-dark dark:text-white">
                            {keyword.searchVolume.toLocaleString("tr-TR")}/ay
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                            Zorluk
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[#E7E7E7] dark:bg-[#062F28] rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  keyword.difficulty < 30
                                    ? "bg-green-600"
                                    : keyword.difficulty < 70
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                                )}
                                style={{ width: `${keyword.difficulty}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-design-dark dark:text-white">
                              {keyword.difficulty}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                            Sayfa
                          </p>
                          <p className="text-sm font-bold text-design-dark dark:text-white truncate">
                            {keyword.url}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveKeyword(keyword.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

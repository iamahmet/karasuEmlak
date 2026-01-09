"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface SERPResult {
  id: string;
  keyword: string;
  position: number;
  previousPosition: number | null;
  url: string;
  title: string;
  description: string;
  lastChecked: string;
}

export function SERPTracker({ locale }: { locale: string }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SERPResult[]>([]);
  const [tracking, setTracking] = useState(false);

  const handleTrack = async () => {
    if (!keyword.trim()) {
      toast.error("Lütfen bir keyword girin");
      return;
    }

    setTracking(true);
    try {
      const response = await fetch("/api/seo/serp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      if (!response.ok) {
        throw new Error("Takip başarısız");
      }

      const data = await response.json();
      
      if (!data.success || !data.result) {
        throw new Error("SERP takibi başarısız");
      }

      setResults([...results, data.result]);
      setKeyword("");
      toast.success("SERP pozisyonu takip ediliyor");
    } catch (error: any) {
      toast.error(error.message || "Takip başarısız");
    } finally {
      setTracking(false);
    }
  };

  const getPositionChange = (current: number, previous: number | null) => {
    if (previous === null) return null;
    return previous - current;
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return "text-green-600";
    if (position <= 10) return "text-blue-600";
    if (position <= 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Add Keyword */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-design-light" />
            SERP Pozisyon Takibi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Takip edilecek keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            />
            <Button
              onClick={handleTrack}
              disabled={tracking || !keyword.trim()}
              className="bg-design-light hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Takip Et
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-bold text-design-dark dark:text-white">
          Takip Edilen Pozisyonlar
        </h3>
        {results.length === 0 ? (
          <Card className="card-professional">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-design-gray dark:text-gray-400 opacity-50" />
              <p className="text-design-gray dark:text-gray-400 font-ui">
                Henüz takip edilen keyword yok
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {results.map((result) => {
              const change = getPositionChange(result.position, result.previousPosition);
              const hasChange = change !== null && change !== 0;

              return (
                <Card key={result.id} className="card-professional hover-lift">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-design-dark dark:text-white font-ui">
                            {result.keyword}
                          </h4>
                          <Badge className={cn("text-[10px] px-2 py-0.5", getPositionColor(result.position))}>
                            Pozisyon: {result.position}
                          </Badge>
                          {hasChange && (
                            <div className="flex items-center gap-1">
                              {change! > 0 ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <span className="text-green-600 font-semibold text-sm">+{change}</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                  <span className="text-red-600 font-semibold text-sm">{change}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-design-dark dark:text-white font-ui">
                            {result.title}
                          </p>
                          <p className="text-xs text-design-gray dark:text-gray-400 font-ui line-clamp-2">
                            {result.description}
                          </p>
                          <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                            {result.url}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

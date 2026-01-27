"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Globe,
  Search,
  Plus,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface Competitor {
  id: string;
  domain: string;
  domainAuthority: number;
  backlinks: number;
  organicKeywords: number;
  traffic: number;
  topKeywords: string[];
}

export function CompetitorAnalysis({ locale }: { locale: string }) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seo/competitors");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.competitors) {
          setCompetitors(data.competitors);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch competitors:", error);
      toast.error("Rakipler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async () => {
    if (!newDomain.trim()) {
      toast.error("Lütfen bir domain girin");
      return;
    }

    setAdding(true);
    try {
      const response = await fetch("/api/seo/competitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Rakip eklenemedi");
      }

      const data = await response.json();
      if (!data.success || !data.competitor) {
        throw new Error("Geçersiz response formatı");
      }

      setCompetitors([...competitors, data.competitor]);
      setNewDomain("");
      toast.success("Rakip eklendi");
    } catch (error: any) {
      toast.error(error.message || "Rakip eklenemedi");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Competitor */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Rakip Analizi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
            />
            <Button
              onClick={handleAddCompetitor}
              disabled={adding || !newDomain.trim()}
              className="bg-design-light hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ekle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Competitors List */}
      {loading ? (
        <Card className="card-professional">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground font-ui">
              Yükleniyor...
            </div>
          </CardContent>
        </Card>
      ) : competitors.length === 0 ? (
        <Card className="card-professional">
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-ui">
              Henüz rakip eklenmemiş
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((competitor) => (
            <Card key={competitor.id} className="card-professional hover-lift">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-foreground font-ui mb-1">
                      {competitor.domain}
                    </h4>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      DA: {competitor.domainAuthority}
                    </Badge>
                  </div>
                  <a
                    href={`https://${competitor.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-green-600"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-ui mb-1">
                      Backlink
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {competitor.backlinks.toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-ui mb-1">
                      Organik Keyword
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {competitor.organicKeywords.toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-ui mb-1">
                      Trafik
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {competitor.traffic.toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-ui mb-1">
                      Domain Authority
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {competitor.domainAuthority}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";

interface Recommendation {
  id: string;
  finding_id: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  steps_json: any[];
  fix_prompt?: string;
  kanban_column: "Now" | "Next" | "Later";
  status: string;
  created_at: string;
}

export function RecommendationsTab({ locale: _locale }: { locale: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColumn, setSelectedColumn] = useState<"Now" | "Next" | "Later" | "all">("all");

  useEffect(() => {
    fetchRecommendations();
  }, [selectedColumn]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedColumn !== "all") params.append("column", selectedColumn);

      const response = await fetch(`/api/project-bot/recommendations?${params}`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading recommendations...</div>;
  }

  const columns: Array<"Now" | "Next" | "Later"> = ["Now", "Next", "Later"];

  return (
    <div className="space-y-6">
      {/* Column Filter */}
      <div className="flex gap-2">
        <Button
          variant={selectedColumn === "all" ? "default" : "outline"}
          onClick={() => setSelectedColumn("all")}
        >
          All
        </Button>
        {columns.map((col) => (
          <Button
            key={col}
            variant={selectedColumn === col ? "default" : "outline"}
            onClick={() => setSelectedColumn(col)}
          >
            {col}
          </Button>
        ))}
      </div>

      {/* Kanban View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => {
          const columnRecs = recommendations.filter(
            (r) => r.kanban_column === column && r.status !== "completed"
          );
          return (
            <div key={column} className="space-y-2">
              <h3 className="font-semibold mb-2">{column}</h3>
              {columnRecs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground text-sm">
                    No recommendations
                  </CardContent>
                </Card>
              ) : (
                columnRecs.map((rec) => (
                  <Card key={rec.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-sm">
                        <span className={`font-semibold ${getImpactColor(rec.impact)}`}>
                          {rec.impact}
                        </span>{" "}
                        impact •{" "}
                        <span className={`font-semibold ${getEffortColor(rec.effort)}`}>
                          {rec.effort}
                        </span>{" "}
                        effort
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {rec.steps_json && rec.steps_json.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium mb-1">Steps:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {rec.steps_json.slice(0, 3).map((step: any, idx: number) => (
                              <li key={idx}>• {step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rec.fix_prompt && (
                        <div className="mb-2">
                          <p className="text-xs font-medium mb-1">Fix Prompt:</p>
                          <p className="text-xs text-muted-foreground">{rec.fix_prompt}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(rec.created_at).toLocaleDateString()}
                        </span>
                        <Button variant="outline" size="sm">
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


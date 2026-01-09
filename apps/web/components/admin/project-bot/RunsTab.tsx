"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface BotRun {
  id: string;
  run_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  findings_count: number;
  errors_count: number;
  warnings_count: number;
}

export function RunsTab({ locale: _locale }: { locale: string }) {
  const [runs, setRuns] = useState<BotRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/project-bot/runs");
      const data = await response.json();
      setRuns(data.runs || []);
    } catch (error) {
      console.error("Failed to fetch runs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading runs...</div>;
  }

  return (
    <div className="space-y-4">
      {runs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No bot runs found. Run a scan to get started.
          </CardContent>
        </Card>
      ) : (
        runs.map((run) => (
          <Card key={run.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(run.status)}
                  <div>
                    <CardTitle className="text-lg capitalize">{run.run_type}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(run.started_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded capitalize ${
                    run.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : run.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {run.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium">{formatDuration(run.duration_ms)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Findings</p>
                  <p className="text-sm font-medium">{run.findings_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Errors</p>
                  <p className="text-sm font-medium text-red-600">{run.errors_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                  <p className="text-sm font-medium text-yellow-600">{run.warnings_count}</p>
                </div>
              </div>
              {run.completed_at && (
                <p className="text-xs text-muted-foreground mt-4">
                  Completed: {new Date(run.completed_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}


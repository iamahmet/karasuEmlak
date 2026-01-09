"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { AlertCircle, Info, CheckCircle2, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";

interface Finding {
  id: string;
  category: string;
  severity: "error" | "warning" | "info";
  title: string;
  description: string;
  affected_files?: string[];
  suggested_fix?: string;
  status: string;
  created_at: string;
}

export function FindingsTab({ locale: _locale }: { locale: string }) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    severity: "all",
    status: "open",
  });

  useEffect(() => {
    fetchFindings();
  }, [filters]);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category !== "all") params.append("category", filters.category);
      if (filters.severity !== "all") params.append("severity", filters.severity);
      if (filters.status !== "all") params.append("status", filters.status);

      const response = await fetch(`/api/project-bot/findings?${params}`);
      const data = await response.json();
      setFindings(data.findings || []);
    } catch (error) {
      console.error("Failed to fetch findings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "border-l-destructive";
      case "warning":
        return "border-l-yellow-500";
      default:
        return "border-l-blue-500";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading findings...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="seo">SEO</SelectItem>
                <SelectItem value="perf">Performance</SelectItem>
                <SelectItem value="i18n">i18n</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity}
              onValueChange={(value) => setFilters({ ...filters, severity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Findings List */}
      <div className="space-y-4">
        {findings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No findings found
            </CardContent>
          </Card>
        ) : (
          findings.map((finding) => (
            <Card
              key={finding.id}
              className={`border-l-4 ${getSeverityColor(finding.severity)}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(finding.severity)}
                    <div>
                      <CardTitle className="text-lg">{finding.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {finding.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-muted capitalize">
                    {finding.severity}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {finding.affected_files && finding.affected_files.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Affected Files:</p>
                    <div className="flex flex-wrap gap-2">
                      {finding.affected_files.slice(0, 5).map((file, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded bg-muted font-mono"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {finding.suggested_fix && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Suggested Fix:</p>
                    <p className="text-sm text-muted-foreground">{finding.suggested_fix}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(finding.created_at).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                    <Button variant="outline" size="sm">
                      Fix
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


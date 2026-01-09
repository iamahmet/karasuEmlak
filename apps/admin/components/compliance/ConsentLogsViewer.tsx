"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface ConsentLogsViewerProps {
  logs: any[];
  totalCount: number;
  currentPage: number;
  limit: number;
  subjectFilter?: string;
}

export function ConsentLogsViewer({
  logs,
  totalCount,
  currentPage,
  limit,
  subjectFilter,
}: ConsentLogsViewerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(subjectFilter || "");

  const totalPages = Math.ceil(totalCount / limit);

  const handleSearch = () => {
    const locale = window.location.pathname.split("/")[1] || "tr";
    router.push(`/${locale}/compliance/logs?subject=${encodeURIComponent(searchTerm)}&page=1`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Consent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by subject ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Logs ({totalCount} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No consent logs found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Subject ID</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Purposes</th>
                      <th className="text-left p-2">Granted</th>
                      <th className="text-left p-2">Policy</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{log.subject_id}</td>
                        <td className="p-2 capitalize">{log.subject_type}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {(log.purposes as string[]).map((p, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded bg-muted capitalize"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              log.granted
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {log.granted ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-2 text-xs">
                          {log.policy_type} v{log.policy_version}
                        </td>
                        <td className="p-2 text-xs">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const locale = window.location.pathname.split("/")[1] || "tr";
                        router.push(`/${locale}/compliance/logs?page=${currentPage - 1}${subjectFilter ? `&subject=${encodeURIComponent(subjectFilter)}` : ""}`);
                      }}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const locale = window.location.pathname.split("/")[1] || "tr";
                        router.push(`/${locale}/compliance/logs?page=${currentPage + 1}${subjectFilter ? `&subject=${encodeURIComponent(subjectFilter)}` : ""}`);
                      }}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


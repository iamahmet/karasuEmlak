"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Shield, User, FileText, Settings, Trash2, Eye, Download, RefreshCw, Filter } from "lucide-react";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";

type LogEntry = {
    id: string;
    event_type: string;
    user_id: string | null;
    resource_type: string | null;
    resource_id: string | null;
    metadata: Record<string, any>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
};

const ACTION_COLORS: Record<string, string> = {
    "content.created": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "content.updated": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "content.deleted": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "content.published": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "content.approved": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "content.rejected": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "user.created": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    "user.updated": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    "user.deleted": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "user.role_changed": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "settings.updated": "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    "error.occurred": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function getEntityIcon(resourceType: string | null) {
    if (!resourceType) return Shield;
    if (resourceType.startsWith("user")) return User;
    if (resourceType.startsWith("content") || resourceType.startsWith("article")) return FileText;
    if (resourceType.startsWith("settings")) return Settings;
    if (resourceType === "listing") return FileText;
    return Shield;
}

function formatDate(iso: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(iso));
}

export function AuditLogViewer({ initialLogs = [] }: { initialLogs?: LogEntry[] }) {
    const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("q", search);
            if (filterType) params.set("type", filterType);
            params.set("limit", "50");

            const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (e) {
            console.error("Failed to fetch audit logs:", e);
        } finally {
            setLoading(false);
        }
    }, [search, filterType]);

    useEffect(() => {
        // Refresh every 30 seconds
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, [fetchLogs]);

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            !search ||
            log.event_type?.includes(search) ||
            log.resource_type?.includes(search) ||
            log.user_id?.includes(search) ||
            log.resource_id?.includes(search);
        const matchesType = !filterType || log.event_type === filterType;
        return matchesSearch && matchesType;
    });

    const uniqueTypes = Array.from(new Set(logs.map((l) => l.event_type))).sort();

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex gap-3 flex-wrap items-center">
                <div className="relative flex-1 min-w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Ara (olay tipi, kayıt ID, kullanıcı...)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-design-light"
                >
                    <option value="">Tüm Olaylar</option>
                    {uniqueTypes.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Yenile
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        const csv = [
                            ["Tarih", "Olay", "Kayıt Tipi", "Kayıt ID", "Kullanıcı ID", "IP"].join(","),
                            ...filteredLogs.map((l) =>
                                [
                                    l.created_at,
                                    l.event_type,
                                    l.resource_type || "",
                                    l.resource_id || "",
                                    l.user_id || "",
                                    l.ip_address || "",
                                ].join(",")
                            ),
                        ].join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `audit-logs-${Date.now()}.csv`;
                        a.click();
                    }}
                >
                    <Download className="h-4 w-4" />
                    CSV İndir
                </Button>
            </div>

            {/* Log count */}
            <p className="text-sm text-muted-foreground">
                {filteredLogs.length} kayıt gösteriliyor
                {filterType && ` · "${filterType}" filtrelendi`}
            </p>

            {/* Logs */}
            <div className="space-y-2">
                {loading && (
                    <div className="text-center py-8 text-muted-foreground animate-pulse">
                        Yükleniyor...
                    </div>
                )}
                {!loading && filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>Henüz audit log kaydı yok</p>
                    </div>
                )}
                {filteredLogs.map((log) => {
                    const Icon = getEntityIcon(log.resource_type);
                    const colorClass = ACTION_COLORS[log.event_type] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
                    const isExpanded = expandedId === log.id;

                    return (
                        <Card
                            key={log.id}
                            className="card-modern hover-lift transition-all duration-200 cursor-pointer overflow-hidden"
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        >
                            <div className="p-4 flex items-start gap-4">
                                <div className="mt-0.5 p-2 rounded-lg bg-design-light/10">
                                    <Icon className="h-4 w-4 text-design-dark dark:text-design-light" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={`text-xs font-mono px-2 py-0.5 rounded border-0 ${colorClass}`}>
                                            {log.event_type}
                                        </Badge>
                                        {log.resource_type && (
                                            <span className="text-xs text-muted-foreground">{log.resource_type}</span>
                                        )}
                                        {log.resource_id && (
                                            <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                                                #{log.resource_id.slice(0, 8)}...
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
                                        {log.user_id && (
                                            <span className="text-xs text-muted-foreground font-mono">
                                                user: {log.user_id.slice(0, 8)}...
                                            </span>
                                        )}
                                        {log.ip_address && (
                                            <span className="text-xs text-muted-foreground">IP: {log.ip_address}</span>
                                        )}
                                    </div>
                                </div>
                                <Eye className={`h-4 w-4 text-muted-foreground shrink-0 transition-opacity ${isExpanded ? "opacity-100" : "opacity-40"}`} />
                            </div>

                            {isExpanded && (
                                <div className="border-t border-border px-4 pb-4 pt-3 bg-muted/30">
                                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                                        Metadata
                                    </h4>
                                    <pre className="text-xs font-mono bg-background rounded p-3 overflow-auto max-h-64 border border-border">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                    {log.user_agent && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            <span className="font-medium">User Agent:</span> {log.user_agent}
                                        </p>
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

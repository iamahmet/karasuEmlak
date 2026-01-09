"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Plus, Link2, Calendar } from "lucide-react";

export function ClusterBuilderTab({ locale: _locale }: { locale: string }) {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCluster, setNewCluster] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/content-studio/clusters");
      const data = await response.json();
      setClusters(data.clusters || []);
    } catch (error) {
      console.error("Failed to fetch clusters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCluster = async () => {
    try {
      const response = await fetch("/api/content-studio/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCluster),
      });
      if (response.ok) {
        setNewCluster({ name: "", description: "" });
        fetchClusters();
      }
    } catch (error) {
      console.error("Failed to create cluster:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading clusters...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Cluster */}
      <Card>
        <CardHeader>
          <CardTitle>Create Topic Cluster</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clusterName">Cluster Name</Label>
            <Input
              id="clusterName"
              value={newCluster.name}
              onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
              placeholder="e.g., 'Local News', 'Sports', 'Technology'"
            />
          </div>
          <div>
            <Label htmlFor="clusterDescription">Description</Label>
            <Input
              id="clusterDescription"
              value={newCluster.description}
              onChange={(e) => setNewCluster({ ...newCluster, description: e.target.value })}
              placeholder="Brief description of the topic cluster"
            />
          </div>
          <Button onClick={handleCreateCluster} disabled={!newCluster.name}>
            <Plus className="h-4 w-4 mr-2" />
            Create Cluster
          </Button>
        </CardContent>
      </Card>

      {/* Existing Clusters */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Topic Clusters</h3>
        {clusters.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No clusters created yet
            </CardContent>
          </Card>
        ) : (
          clusters.map((cluster) => (
            <Card key={cluster.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cluster.name}</CardTitle>
                    {cluster.description && (
                      <p className="text-sm text-muted-foreground mt-1">{cluster.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                    <span>{cluster.spoke_count || 0} spokes</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Manage Hub
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    View Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


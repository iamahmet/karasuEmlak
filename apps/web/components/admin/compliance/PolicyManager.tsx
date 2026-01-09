"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Plus, Edit } from "lucide-react";

interface PolicyManagerProps {
  policies: any[];
}

export function PolicyManager({ policies: initialPolicies }: PolicyManagerProps) {
  const [policies, setPolicies] = useState(initialPolicies);
  const [_editingPolicy, setEditingPolicy] = useState<any>(null);
  const [newPolicy, setNewPolicy] = useState({
    type: "kvkk",
    version: "",
    locale: "tr",
    content: "",
    status: "draft",
    effective_date: "",
  });

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch("/api/compliance/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy),
      });
      if (response.ok) {
        const data = await response.json();
        setPolicies([...policies, data.policy]);
        setNewPolicy({
          type: "kvkk",
          version: "",
          locale: "tr",
          content: "",
          status: "draft",
          effective_date: "",
        });
      }
    } catch (error) {
      console.error("Failed to create policy:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="policyType">Policy Type</Label>
              <Select
                value={newPolicy.type}
                onValueChange={(value) => setNewPolicy({ ...newPolicy, type: value })}
              >
                <SelectTrigger id="policyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kvkk">KVKK (Turkish GDPR)</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                  <SelectItem value="cookie">Cookie Policy</SelectItem>
                  <SelectItem value="privacy">Privacy Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="policyLocale">Locale</Label>
              <Select
                value={newPolicy.locale}
                onValueChange={(value) => setNewPolicy({ ...newPolicy, locale: value })}
              >
                <SelectTrigger id="policyLocale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Turkish</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="et">Estonian</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="policyVersion">Version</Label>
              <Input
                id="policyVersion"
                value={newPolicy.version}
                onChange={(e) => setNewPolicy({ ...newPolicy, version: e.target.value })}
                placeholder="e.g., 1.0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="policyContent">Content</Label>
            <Textarea
              id="policyContent"
              value={newPolicy.content}
              onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
              rows={10}
              placeholder="Policy content (HTML supported)"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreatePolicy} disabled={!newPolicy.version || !newPolicy.content}>
              Create Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Policies by Type */}
      <Tabs defaultValue="kvkk" className="w-full">
        <TabsList>
          <TabsTrigger value="kvkk">KVKK</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="cookie">Cookie</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {["kvkk", "gdpr", "cookie", "privacy"].map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {["tr", "en", "et", "ru", "ar"].map((locale) => {
              const localePolicies = policies.filter(
                (p) => p.type === type && p.locale === locale
              );
              if (localePolicies.length === 0) return null;

              return (
                <Card key={locale}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{type} - {locale.toUpperCase()}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {localePolicies.length} version{localePolicies.length !== 1 ? "s" : ""}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {localePolicies.map((policy) => (
                        <div
                          key={policy.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <p className="font-medium">Version {policy.version}</p>
                            <p className="text-sm text-muted-foreground">
                              {policy.status === "active" ? (
                                <span className="text-green-600">Active</span>
                              ) : (
                                <span className="text-gray-600">Draft</span>
                              )}
                              {policy.effective_date &&
                                ` • Effective: ${new Date(policy.effective_date).toLocaleDateString()}`}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPolicy(policy)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}


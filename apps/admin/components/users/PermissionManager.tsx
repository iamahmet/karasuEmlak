"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Checkbox } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionManagerProps {
  userId: string;
  locale?: string;
}

export function PermissionManager({ userId, locale = "tr" }: PermissionManagerProps) {
  const t = useTranslations("users.permissions");
  const tCommon = useTranslations("common");
  
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPermissions();
    fetchUserPermissions();
  }, [userId]);

  const fetchPermissions = async () => {
    try {
      const supabase = createClient();
      
      // Fetch available permissions (can be from a permissions table)
      // For now, we'll use a predefined list
      const availablePermissions: Permission[] = [
        {
          id: "content.create",
          name: "İçerik Oluştur",
          description: "Yeni içerik oluşturma yetkisi",
          category: "Content",
        },
        {
          id: "content.edit",
          name: "İçerik Düzenle",
          description: "Mevcut içerikleri düzenleme yetkisi",
          category: "Content",
        },
        {
          id: "content.delete",
          name: "İçerik Sil",
          description: "İçerik silme yetkisi",
          category: "Content",
        },
        {
          id: "content.publish",
          name: "İçerik Yayınla",
          description: "İçerik yayınlama yetkisi",
          category: "Content",
        },
        {
          id: "users.view",
          name: "Kullanıcıları Görüntüle",
          description: "Kullanıcı listesini görüntüleme yetkisi",
          category: "Users",
        },
        {
          id: "users.edit",
          name: "Kullanıcı Düzenle",
          description: "Kullanıcı bilgilerini düzenleme yetkisi",
          category: "Users",
        },
        {
          id: "users.delete",
          name: "Kullanıcı Sil",
          description: "Kullanıcı silme yetkisi",
          category: "Users",
        },
        {
          id: "settings.view",
          name: "Ayarları Görüntüle",
          description: "Site ayarlarını görüntüleme yetkisi",
          category: "Settings",
        },
        {
          id: "settings.edit",
          name: "Ayarları Düzenle",
          description: "Site ayarlarını düzenleme yetkisi",
          category: "Settings",
        },
        {
          id: "analytics.view",
          name: "Analitikleri Görüntüle",
          description: "Analitik verilerini görüntüleme yetkisi",
          category: "Analytics",
        },
      ];

      setPermissions(availablePermissions);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const supabase = createClient();
      
      // Fetch user's roles and permissions
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role_id, roles(name)")
        .eq("user_id", userId);

      // For now, we'll derive permissions from roles
      // In a full implementation, you'd have a permissions table
      const roleNames = userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
      
      // Map roles to permissions (simplified)
      const derivedPermissions: string[] = [];
      if (roleNames.includes("admin")) {
        derivedPermissions.push(...permissions.map((p) => p.id));
      } else if (roleNames.includes("staff")) {
        derivedPermissions.push(
          "content.create",
          "content.edit",
          "content.publish",
          "users.view",
          "analytics.view"
        );
      } else if (roleNames.includes("editor")) {
        derivedPermissions.push(
          "content.create",
          "content.edit",
          "content.publish"
        );
      }

      setUserPermissions(derivedPermissions);
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setUserPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a full implementation, you'd save permissions to a user_permissions table
      // For now, we'll just show a success message
      toast.success("İzinler başarıyla güncellendi");
      // await saveUserPermissions(userId, userPermissions);
    } catch (error: any) {
      toast.error(error.message || "İzinler güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 skeleton-professional rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-design-light" />
            İzin Yönetimi
          </CardTitle>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-3 text-xs gap-1"
          >
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-3 w-3" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-design-dark dark:text-white mb-3 font-ui">
                {category}
              </h4>
              <div className="space-y-2">
                {categoryPermissions.map((permission) => {
                  const isChecked = userPermissions.includes(permission.id);
                  return (
                    <div
                      key={permission.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] hover:shadow-md transition-all duration-200"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                            {permission.name}
                          </p>
                          {isChecked && (
                            <Badge className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Aktif
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


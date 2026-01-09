"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Mail,
  Calendar,
  Shield,
  CheckCircle2,
  Edit,
  Send,
  RefreshCw,
  Plus,
  X,
  Loader2,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@karasu/ui";
import { cn } from "@karasu/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@karasu/ui";
import { UserActivityLog } from "./UserActivityLog";
import { UserAnalytics } from "./UserAnalytics";
import { PermissionManager } from "./PermissionManager";

interface UserDetailModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onEdit?: (userId: string) => void;
  onRoleChange?: (userId: string, roleName: string, action: "add" | "remove") => Promise<void>;
  locale: string;
}

export function UserDetailModal({
  locale,
  userId,
  open,
  onClose,
  onEdit,
  onRoleChange,
}: UserDetailModalProps) {
  const t = useTranslations("users.detail");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [addingRole, setAddingRole] = useState(false);
  const [newRole, setNewRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userId && open) {
      fetchUserDetails();
    }
  }, [userId, open]);

  const fetchUserDetails = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Use server-side API instead of client-side admin API
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kullanıcı bilgileri yüklenemedi");
      }

      const data = await response.json();
      
      if (!data.success || !data.user) {
        throw new Error("Invalid response format");
      }

      setUser(data.user);
    } catch (error: any) {
      console.error("Failed to fetch user details:", error);
      toast.error(error.message || "Kullanıcı bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userId) return;

    setResendingVerification(true);
    try {
      const response = await fetch(`/api/users/${userId}/resend-verification`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Doğrulama email'i gönderilemedi");
      }

      toast.success("Doğrulama email'i gönderildi");
    } catch (error: any) {
      console.error("Failed to resend verification:", error);
      toast.error(error.message || "Doğrulama email'i gönderilemedi");
    } finally {
      setResendingVerification(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "staff":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "user":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-design-light" />
            <p className="text-design-gray dark:text-gray-400">{t("loading")}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="py-8 text-center">
            <p className="text-design-gray dark:text-gray-400">{t("errors.userNotFound")}</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              {t("actions.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Ensure roles is always an array
  const userRoles = Array.isArray(user.roles) ? user.roles : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-design-light to-green-600 flex items-center justify-center text-white font-bold text-lg">
              {user.profile?.name
                ? user.profile.name.charAt(0).toUpperCase()
                : user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-display font-bold text-design-dark dark:text-white">
                {user.profile?.name || "İsimsiz Kullanıcı"}
              </p>
              <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
                {user.email}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            {t("description") || "Kullanıcı detaylarını görüntüleyin ve yönetin"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-ui font-semibold text-design-dark dark:text-white uppercase">
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                    E-posta
                  </p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-design-gray dark:text-gray-400" />
                    <span className="text-sm text-design-dark dark:text-white font-ui">
                      {user.email}
                    </span>
                    {user.email_confirmed_at ? (
                      <div className="relative group">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="absolute left-full ml-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          Email doğrulanmış
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-600 dark:text-orange-400">Doğrulanmamış</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={resendingVerification}
                          className="h-6 px-2 text-xs gap-1"
                        >
                          {resendingVerification ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          Tekrar Gönder
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                    Durum
                  </p>
                  <Badge
                    className={cn(
                      "text-[10px] px-2 py-0.5",
                      user.banned_until
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    )}
                  >
                    {user.banned_until ? "Yasaklı" : "Aktif"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                    Kayıt Tarihi
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-design-gray dark:text-gray-400" />
                    <span className="text-sm text-design-dark dark:text-white font-ui">
                      {formatDateTime(user.created_at)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                    Son Giriş
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-design-gray dark:text-gray-400" />
                    <span className="text-sm text-design-dark dark:text-white font-ui">
                      {user.last_sign_in_at
                        ? formatDateTime(user.last_sign_in_at)
                        : "Hiç giriş yapmamış"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-ui font-semibold text-design-dark dark:text-white uppercase flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t("roles.title")}
                </h3>
                {onRoleChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingRole(!addingRole)}
                    className="gap-2 h-7 text-xs"
                  >
                    {addingRole ? (
                      <>
                        <X className="h-3 w-3" />
                        {t("roles.cancel")}
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        {t("roles.add")}
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {userRoles.length > 0 ? (
                  userRoles.map((role: string) => (
                    <Badge
                      key={role}
                      className={cn("text-[10px] px-2 py-0.5 flex items-center gap-1", getRoleBadgeColor(role))}
                    >
                      {role}
                      {onRoleChange && (
                        <button
                          onClick={async () => {
                            if (onRoleChange && userId) {
                              try {
                                await onRoleChange(userId, role, "remove");
                                fetchUserDetails(); // Refresh user data
                              } catch {
                                // Error already handled in parent
                              }
                            }
                          }}
                          className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                          aria-label={`Remove ${role} role`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <Badge className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    user
                  </Badge>
                )}
              </div>
              {addingRole && onRoleChange && (
                <div className="flex gap-2 items-center">
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder={t("roles.selectPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {!userRoles.includes("admin") && (
                        <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                      )}
                      {!userRoles.includes("staff") && (
                        <SelectItem value="staff">{t("roles.staff")}</SelectItem>
                      )}
                      {!userRoles.includes("editor") && (
                        <SelectItem value="editor">{t("roles.editor")}</SelectItem>
                      )}
                      {!userRoles.includes("viewer") && (
                        <SelectItem value="viewer">{t("roles.viewer")}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (newRole && onRoleChange && userId) {
                        try {
                          await onRoleChange(userId, newRole, "add");
                          setNewRole(undefined);
                          setAddingRole(false);
                          fetchUserDetails(); // Refresh user data
                        } catch {
                          // Error already handled in parent
                        }
                      }
                    }}
                    disabled={!newRole}
                    className="h-8 text-xs gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    {t("roles.addButton")}
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-[#E7E7E7] dark:border-[#062F28]">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  if (onEdit && userId) {
                    onEdit(userId);
                  }
                  onClose();
                }}
              >
                <Edit className="h-4 w-4" />
                Düzenle
              </Button>
            </div>

            {/* Additional Tabs */}
            <Tabs defaultValue="activity" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Aktivite
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analitik
                </TabsTrigger>
                <TabsTrigger value="permissions" className="gap-2">
                  <Shield className="h-4 w-4" />
                  İzinler
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-4">
                {userId && <UserActivityLog userId={userId} locale="tr" />}
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                {userId && <UserAnalytics userId={userId} locale={locale} />}
              </TabsContent>

              <TabsContent value="permissions" className="mt-4">
                {userId && <PermissionManager userId={userId} locale={locale} />}
              </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}


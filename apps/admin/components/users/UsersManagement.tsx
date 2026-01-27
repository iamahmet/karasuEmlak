"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { UsersTable } from "./UsersTable";
import { UserStats } from "./UserStats";
import { UserDetailModal } from "./UserDetailModal";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { UsersAnalytics } from "./UsersAnalytics";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
  email_verified: boolean;
  is_active: boolean;
}

export function UsersManagement({
  locale,
  initialTab = "all",
}: {
  locale: string;
  initialTab?: string;
  initialRole?: string;
}) {
  const t = useTranslations("users");
  const [allUsers, setAllUsers] = useState<User[]>([]); // Store all users
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    fetchUsers();
  }, []); // Fetch once on mount

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        const errorMessage = data.error || t("errors.fetchFailed");
        throw new Error(errorMessage);
      }

      if (!data.users) {
        throw new Error(t("errors.invalidResponse"));
      }
      
      // Transform users data - store ALL users
      const transformedUsers: User[] = (data.users || []).map((user: any) => {
        const transformed = {
          id: user.id,
          email: user.email || "",
          name: user.profile?.name || null,
          avatar_url: user.profile?.avatar_url || null,
          roles: Array.isArray(user.roles) 
            ? user.roles.map((r: any) => (typeof r === "string" ? r : r?.role || "")).filter(Boolean)
            : [],
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_verified: !!user.email_confirmed_at,
          is_active: !user.banned_until,
        };
        return transformed;
      });

      setAllUsers(transformedUsers);
    } catch (error: any) {
      // Error logged via error handler
      toast.error(error.message || t("errors.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on active tab - memoized for performance
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // Safe access to user properties
      const userRoles = Array.isArray(u?.roles) ? u.roles : [];
      const isActive = u?.is_active ?? true;

      if (activeTab === "admin") {
        return userRoles.includes("admin");
      } else if (activeTab === "staff") {
        return userRoles.includes("staff");
      } else if (activeTab === "active") {
        return isActive;
      } else if (activeTab === "inactive") {
        return !isActive;
      }
      return true; // "all" tab
    });
  }, [allUsers, activeTab]);

  const handleRoleChange = async (userId: string, roleName: string, action: "add" | "remove") => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleName, action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("errors.roleUpdateFailed"));
      }

      toast.success(
        action === "add" ? t("success.roleAdded") : t("success.roleRemoved")
      );
      fetchUsers(); // Refresh users list
    } catch (error: any) {
      console.error("Failed to change role:", error);
      toast.error(error.message || t("errors.roleUpdateFailed"));
    }
  };

  const handleUserUpdate = (userId: string) => {
    setSelectedUserId(userId);
    setDetailModalOpen(true);
  };

  const handleUserEdit = (userId: string) => {
    setSelectedUserId(userId);
    setDetailModalOpen(false); // Close detail modal if open
    setEditModalOpen(true);
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm(t("confirmations.deleteUser"))) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(t("errors.deleteFailed"));
      }

      toast.success(t("success.userDeleted"));
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || t("errors.deleteFailed"));
    }
  };

  const handleSendEmail = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "welcome" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Email gönderilemedi");
      }

      toast.success("Email başarıyla gönderildi");
    } catch (error: any) {
      throw error;
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Şifre sıfırlanamadı");
      }

      toast.success("Şifre sıfırlama linki gönderildi");
    } catch (error: any) {
      throw error;
    }
  };

  const handleSendMagicLink = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Magic link gönderilemedi");
      }

      toast.success("Magic link başarıyla gönderildi");
    } catch (error: any) {
      throw error;
    }
  };

  // Calculate stats from ALL users (not filtered)
  const stats = useMemo(() => {
    return {
      total: allUsers.length,
      admin: allUsers.filter((u) => {
        const roles = Array.isArray(u?.roles) ? u.roles : [];
        return roles.includes("admin");
      }).length,
      staff: allUsers.filter((u) => {
        const roles = Array.isArray(u?.roles) ? u.roles : [];
        return roles.includes("staff");
      }).length,
      active: allUsers.filter((u) => u?.is_active ?? true).length,
      inactive: allUsers.filter((u) => !(u?.is_active ?? true)).length,
    };
  }, [allUsers]);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setCreateModalOpen(true);
          }}
          className="gap-2"
          style={{ pointerEvents: 'auto' }}
        >
          <Plus className="h-4 w-4" />
          {t("actions.createUser")}
        </Button>
      </div>

      {/* Stats */}
      <UserStats
        totalUsers={stats.total}
        adminUsers={stats.admin}
        staffUsers={stats.staff}
        activeUsers={stats.active}
        inactiveUsers={stats.inactive}
      />

      {/* Users Analytics Charts */}
      <UsersAnalytics users={allUsers} />

      {/* Tabs */}
      <Card className="card-professional overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-border/40">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto gap-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-ui font-semibold text-sm transition-all hover:bg-muted"
                >
                  {t("tabs.all")} ({stats.total})
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-ui font-semibold text-sm transition-all hover:bg-muted"
                >
                  {t("tabs.admin")} ({stats.admin})
                </TabsTrigger>
                <TabsTrigger
                  value="staff"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-ui font-semibold text-sm transition-all hover:bg-muted"
                >
                  {t("tabs.staff")} ({stats.staff})
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-ui font-semibold text-sm transition-all hover:bg-muted"
                >
                  {t("tabs.active")} ({stats.active})
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 font-ui font-semibold text-sm transition-all hover:bg-muted"
                >
                  {t("tabs.inactive")} ({stats.inactive})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0 p-6">
              <UsersTable
                users={filteredUsers}
                loading={loading}
                onRoleChange={handleRoleChange}
                onUserUpdate={handleUserUpdate}
                onUserEdit={handleUserEdit}
                onUserDelete={handleUserDelete}
                onSendEmail={handleSendEmail}
                onResetPassword={handleResetPassword}
                onSendMagicLink={handleSendMagicLink}
                locale={locale}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedUserId(null);
        }}
        onUpdate={fetchUsers}
        onEdit={handleUserEdit}
        onRoleChange={handleRoleChange}
        locale={locale}
      />

      {/* Create User Modal */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchUsers}
      />

      {/* Edit User Modal */}
      <EditUserModal
        userId={selectedUserId}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUserId(null);
        }}
        onSuccess={fetchUsers}
        onRoleChange={handleRoleChange}
      />
    </div>
  );
}

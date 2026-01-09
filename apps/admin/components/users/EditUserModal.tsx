"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Edit, Loader2, Mail, User, Key, Shield, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { cn } from "@karasu/lib";
import { validateEmail, validatePassword } from "@/lib/validation/validators";
import { FormError } from "@/components/ui/FormError";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import { TextField } from "@/components/forms/FormField";

interface EditUserModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRoleChange?: (userId: string, roleName: string, action: "add" | "remove") => Promise<void>;
}

export function EditUserModal({ userId, open, onClose, onSuccess, onRoleChange }: EditUserModalProps) {
  const t = useTranslations("users.edit");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [addingRole, setAddingRole] = useState(false);
  const [newRole, setNewRole] = useState<string | undefined>(undefined);

  // Use form validation hook
  const {
    values: formData,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    handleChange,
    handleBlur,
    reset,
    validate,
  } = useFormValidation({
    initialValues: {
      email: "",
      name: "",
      password: "",
      avatar_url: "",
    },
    validators: {
      email: (value) => validateEmail(value),
      password: (value) => {
        // Password is optional when editing, but if provided, must be valid
        if (!value || value.length === 0) return { valid: true };
        return validatePassword(value, { minLength: 6 });
      },
      name: (value) => ({ valid: true }), // Optional
      avatar_url: (value) => ({ valid: true }), // Optional
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  useEffect(() => {
    if (userId && open) {
      fetchUser();
    }
  }, [userId, open]);

  const fetchUser = async () => {
    if (!userId) return;

    setFetching(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || t("errors.fetchFailed"));
      }

      setUser(data.user);
      // Update form values using setValue
      setValue("email", data.user.email || "");
      setValue("name", data.user.profile?.name || "");
      setValue("avatar_url", data.user.profile?.avatar_url || "");
      setValue("password", "");
      setAddingRole(false);
      setNewRole(undefined);
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch user:", error);
      }
      toast.error(error.message || t("errors.fetchFailed"));
    } finally {
      setFetching(false);
    }
  };

  // Validation is handled by useFormValidation hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Client-side validation
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        email: formData.email,
        name: formData.name,
        avatar_url: formData.avatar_url,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${userId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errors.updateFailed"));
      }

      toast.success(t("success.userUpdated"));
      fetchUser(); // Refresh user data to get updated roles
      onSuccess();
      onClose();
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to update user:", error);
      }
      toast.error(error.message || t("errors.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "staff":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "editor":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "viewer":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "user":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (fetching) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
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
        <DialogContent>
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
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-design-light" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("description") || "Kullanıcı bilgilerini düzenleyin"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                {t("tabs.profile")}
              </TabsTrigger>
              <TabsTrigger value="account" className="gap-2">
                <Mail className="h-4 w-4" />
                {t("tabs.account")}
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="h-4 w-4" />
                {t("tabs.roles")}
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Key className="h-4 w-4" />
                {t("tabs.security")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <TextField
                label={t("fields.name")}
                name="name"
                type="text"
                value={formData.name || ""}
                onChange={handleChange("name")}
                onBlur={handleBlur("name")}
                placeholder={t("placeholders.name")}
                hint="Kullanıcının adı (isteğe bağlı)"
              />

              <TextField
                label={t("fields.avatarUrl")}
                name="avatar_url"
                type="url"
                value={formData.avatar_url || ""}
                onChange={handleChange("avatar_url")}
                onBlur={handleBlur("avatar_url")}
                placeholder={t("placeholders.avatarUrl")}
                hint="Avatar görseli URL'i (isteğe bağlı)"
              />
            </TabsContent>

            <TabsContent value="account" className="space-y-4 mt-4">
              <TextField
                label={t("fields.email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                error={touched.email ? errors.email : undefined}
                required
                placeholder={t("placeholders.email")}
              />
            </TabsContent>

            <TabsContent value="roles" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-ui font-semibold">
                    {t("fields.roles")}
                  </Label>
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
                                  fetchUser(); // Refresh user data
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
                  <div className="flex gap-2 items-center pt-2">
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
                          fetchUser(); // Refresh user data
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
            </TabsContent>

            <TabsContent value="security" className="space-y-4 mt-4">
              <TextField
                label={t("fields.newPassword")}
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={handleChange("password")}
                onBlur={handleBlur("password")}
                error={touched.password ? errors.password : undefined}
                placeholder="••••••••"
                hint={t("fields.passwordHint") || "En az 6 karakter olmalıdır (isteğe bağlı)"}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4 border-t border-[#E7E7E7] dark:border-[#062F28]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("actions.saving")}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("actions.save")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


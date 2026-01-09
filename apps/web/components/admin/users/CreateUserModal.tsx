"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateEmail, validatePassword } from "@/lib/validation/validators";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import { TextField, SelectField } from "@/components/forms/FormField";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const t = useTranslations("users.create");
  const [loading, setLoading] = useState(false);
  const [sendMagicLink, setSendMagicLink] = useState(false);

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
      password: "",
      name: "",
      role: undefined as string | undefined,
    },
    validators: {
      email: (value) => validateEmail(value),
      password: (value) => {
        if (sendMagicLink) return { valid: true };
        // Use inline validation since validatePassword only accepts 1 argument
        if (!value || value.length < 6) {
          return { valid: false, error: "Şifre en az 6 karakter olmalıdır" };
        }
        return { valid: true };
      },
      name: (value) => ({ valid: true }), // Optional field
      role: (value) => ({ valid: true }), // Optional field
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sendMagicLink,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errors.createFailed"));
      }

      toast.success(
        sendMagicLink
          ? t("success.magicLinkSent")
          : t("success.userCreated")
      );
      
      // Reset form
      reset();
      setSendMagicLink(false);

      onSuccess();
      onClose();
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to create user:", error);
      }
      toast.error(error.message || t("errors.createFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-design-light" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("description") || "Yeni bir kullanıcı hesabı oluşturun"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            hint="Kullanıcının e-posta adresi"
          />

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

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="magicLink" className="text-xs font-ui font-semibold">
                {t("fields.magicLink")}
              </Label>
              <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                {t("fields.magicLinkDescription")}
              </p>
            </div>
            <Switch
              id="magicLink"
              checked={sendMagicLink}
              onCheckedChange={(checked) => {
                setSendMagicLink(checked);
                // Re-validate password when magic link is toggled
                if (checked) {
                  setTouched("password", false);
                } else {
                  setTouched("password", true);
                }
              }}
            />
          </div>

          {!sendMagicLink && (
            <TextField
              label={t("fields.password")}
              name="password"
              type="password"
              value={formData.password || ""}
              onChange={handleChange("password")}
              onBlur={handleBlur("password")}
              error={touched.password ? errors.password : undefined}
              required
              placeholder="••••••••"
              hint={t("fields.passwordHint") || "En az 6 karakter olmalıdır"}
            />
          )}

          <SelectField
            label={t("fields.role")}
            name="role"
            value={formData.role || "none"}
            onChange={(value) => {
              // Use "none" instead of empty string, convert to undefined for API
              setValue("role", value === "none" ? undefined : value);
            }}
            options={[
              { value: "none", label: t("roles.none") },
              { value: "admin", label: t("roles.admin") },
              { value: "staff", label: t("roles.staff") },
              { value: "editor", label: t("roles.editor") },
              { value: "viewer", label: t("roles.viewer") },
            ]}
            placeholder={t("placeholders.role")}
          />

          <div className="flex gap-3 pt-4">
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
                  {t("actions.creating")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("actions.create")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


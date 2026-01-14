"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Label } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface ReviewAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: "article" | "news" | "listing" | "page";
  contentId: string;
  contentTitle?: string;
  onAssigned?: () => void;
}

export function ReviewAssignmentModal({
  open,
  onOpenChange,
  contentType,
  contentId,
  contentTitle,
  onAssigned,
}: ReviewAssignmentModalProps) {
  const [reviewerId, setReviewerId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      // Filter for staff/admin users
      const staffUsers = data.users?.filter(
        (user: any) =>
          user.roles?.some((role: string) =>
            ["super_admin", "admin", "staff"].includes(role)
          )
      ) || [];
      setUsers(staffUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Kullanıcılar yüklenemedi");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleAssign = async () => {
    if (!reviewerId) {
      toast.error("Lütfen bir inceleyici seçin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/workflow/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          reviewerId,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Atama başarısız");
      }

      toast.success("İçerik inceleme için atandı");
      onAssigned?.();
      onOpenChange(false);
      setReviewerId("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Atama başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            İnceleme Ataması
          </DialogTitle>
          <DialogDescription>
            {contentTitle && (
              <span className="block mt-2 text-sm font-medium">
                {contentTitle}
              </span>
            )}
            İçeriği incelemesi için bir kullanıcı atayın.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reviewer">İnceleyici</Label>
            <Select
              value={reviewerId}
              onValueChange={setReviewerId}
              disabled={fetchingUsers}
            >
              <SelectTrigger id="reviewer">
                <SelectValue placeholder="İnceleyici seçin" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fetchingUsers && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Kullanıcılar yükleniyor...
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
            <Textarea
              id="notes"
              placeholder="İnceleyici için notlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            İptal
          </Button>
          <Button onClick={handleAssign} disabled={loading || !reviewerId}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Atanıyor...
              </>
            ) : (
              "Ata"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

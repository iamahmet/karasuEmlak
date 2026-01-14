"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Label } from "@karasu/ui";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { cn } from "@karasu/lib";

interface Review {
  id: string;
  content_type: string;
  content_id: string;
  reviewer_id: string | null;
  assigned_by: string | null;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface ReviewPanelProps {
  contentType: "article" | "news" | "listing" | "page";
  contentId: string;
  currentReview?: Review | null;
  onReviewSubmitted?: () => void;
}

export function ReviewPanel({
  contentType,
  contentId,
  currentReview,
  onReviewSubmitted,
}: ReviewPanelProps) {
  const [review, setReview] = useState<Review | null>(currentReview || null);
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<"approved" | "rejected" | "changes_requested">("approved");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (currentReview) {
      setReview(currentReview);
      setNotes(currentReview.notes || "");
    } else {
      fetchCurrentReview();
    }
  }, [contentType, contentId, currentReview]);

  const fetchCurrentReview = async () => {
    setFetching(true);
    try {
      const response = await fetch(
        `/api/workflow/pending?contentType=${contentType}&contentId=${contentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch review");

      const data = await response.json();
      if (data.reviews && data.reviews.length > 0) {
        setReview(data.reviews[0]);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!review) {
      toast.error("Review bulunamadı");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/workflow/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          status,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Review gönderilemedi");
      }

      toast.success(
        status === "approved"
          ? "İçerik onaylandı"
          : status === "rejected"
          ? "İçerik reddedildi"
          : "Değişiklik isteği gönderildi"
      );
      onReviewSubmitted?.();
      await fetchCurrentReview();
    } catch (error: any) {
      toast.error(error.message || "Review gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!review) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            Bu içerik için aktif bir review bulunmuyor.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPending = review.status === "pending";
  const isCompleted = review.status !== "pending";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            İnceleme Durumu
          </CardTitle>
          <WorkflowStatusBadge status={review.status as any} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCompleted && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              {review.status === "approved" && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              {review.status === "rejected" && (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              {review.status === "changes_requested" && (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <span className="font-medium">
                {review.status === "approved"
                  ? "Onaylandı"
                  : review.status === "rejected"
                  ? "Reddedildi"
                  : "Değişiklik İstendi"}
              </span>
              {review.reviewed_at && (
                <span className="text-muted-foreground text-xs">
                  {new Date(review.reviewed_at).toLocaleDateString("tr-TR")}
                </span>
              )}
            </div>
            {review.notes && (
              <p className="mt-2 text-sm text-muted-foreground">{review.notes}</p>
            )}
          </div>
        )}

        {isPending && (
          <>
            <div className="space-y-2">
              <Label>İnceleme Kararı</Label>
              <div className="flex gap-2">
                <Button
                  variant={status === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus("approved")}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Onayla
                </Button>
                <Button
                  variant={status === "changes_requested" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus("changes_requested")}
                  className="flex-1"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Değişiklik İste
                </Button>
                <Button
                  variant={status === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus("rejected")}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reddet
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-notes">Notlar</Label>
              <Textarea
                id="review-notes"
                placeholder="İnceleme notlarınızı buraya yazın..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                "İncelemeyi Gönder"
              )}
            </Button>
          </>
        )}

        <div className="pt-4 border-t space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Oluşturulma:</span>
            <span>{new Date(review.created_at).toLocaleDateString("tr-TR")}</span>
          </div>
          {review.reviewed_at && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">İncelenme:</span>
              <span>{new Date(review.reviewed_at).toLocaleDateString("tr-TR")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

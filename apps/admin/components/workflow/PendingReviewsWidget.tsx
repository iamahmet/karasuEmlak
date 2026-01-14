"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Clock, Loader2, FileText, Eye, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { cn } from "@karasu/lib";

interface PendingReview {
  id: string;
  content_type: string;
  content_id: string;
  status: string;
  content?: {
    id: string;
    title: string;
    slug?: string;
  } | null;
  created_at: string;
}

export function PendingReviewsWidget() {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch("/api/workflow/pending");
      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      article: "Makale",
      news: "Haber",
      listing: "İlan",
      page: "Sayfa",
    };
    return labels[type] || type;
  };

  const handleReviewClick = (review: PendingReview) => {
    const routes: Record<string, string> = {
      article: `/articles/${review.content_id}`,
      news: `/haberler/${review.content_id}`,
      listing: `/listings/${review.content_id}`,
      page: `/pages/${review.content_id}`,
    };

    const route = routes[review.content_type];
    if (route) {
      router.push(route);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            İnceleme Bekleyen İçerikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            İnceleme Bekleyen İçerikler
          </CardTitle>
          {reviews.length > 0 && (
            <Badge variant="secondary">{reviews.length}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              İnceleme bekleyen içerik bulunmuyor
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => handleReviewClick(review)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">
                      {getContentTypeLabel(review.content_type)}
                    </Badge>
                    <WorkflowStatusBadge status="review" showIcon={false} />
                  </div>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {review.content?.title || "İçerik başlığı yok"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.created_at).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-2" />
              </div>
            ))}
            {reviews.length > 5 && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => router.push("/workflow/pending")}
              >
                Tümünü Gör ({reviews.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

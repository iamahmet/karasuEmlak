"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { MessageSquare, Send, User, Mail, Globe, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchWithRetry } from "@/lib/utils/api-client";

interface Comment {
  id: string;
  author_name: string;
  author_email?: string;
  author_website?: string;
  content: string;
  created_at: string;
  parent_id?: string;
}

interface CommentsSectionProps {
  contentId?: string;
  listingId?: string;
  locale?: string;
}

export function CommentsSection({ contentId, listingId, locale = "tr" }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    author_website: "",
    content: "",
  });

  useEffect(() => {
    fetchComments();
  }, [contentId, listingId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (contentId) params.append("content_id", contentId);
      if (listingId) params.append("listing_id", listingId);
      params.append("status", "approved");

      const response = await fetchWithRetry<{ success: boolean; comments?: any[]; error?: string }>(`/api/comments?${params.toString()}`);

      if (response.success) {
        setComments((response as any).comments || []);
      } else {
        // Handle error gracefully - set empty array
        setComments([]);
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn("Comments API returned error:", response.error);
        }
      }
    } catch (error: any) {
      // Gracefully handle errors - set empty array
      setComments([]);
      // Only log in development, and only if it's not a schema cache error
      if (process.env.NODE_ENV === 'development' && !error.message?.includes('schema cache')) {
        console.warn("Failed to fetch comments:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.author_name || !formData.content) {
      toast.error("Lütfen isim ve yorum alanlarını doldurun");
      return;
    }

    try {
      setSubmitting(true);
      const data = await fetchWithRetry("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: contentId,
          listing_id: listingId,
          ...formData,
        }),
      });

      if (!data.success) {
        throw new Error(data.error || data.message || "Yorum gönderilemedi");
      }

      toast.success("Yorumunuz gönderildi. Onaylandıktan sonra yayınlanacaktır.");
      setFormData({
        author_name: "",
        author_email: "",
        author_website: "",
        content: "",
      });
      setShowForm(false);
      fetchComments();
    } catch (error: any) {
      const { handleApiError } = await import('@/lib/utils/api-client');
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.userFriendly);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? "Az önce" : `${diffMins} dakika önce`;
      }
      return `${diffHours} saat önce`;
    } else if (diffDays === 1) {
      return "Dün";
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  return (
    <section className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-design-light" />
            Yorumlar
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {comments.length} {comments.length === 1 ? "yorum" : "yorum"}
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-design-light to-green-600 hover:from-design-dark hover:to-green-700 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Yorum Yap
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && (
        <Card className="mb-8 animate-slide-in-up border-2 border-design-light/20">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author_name" className="text-sm font-semibold mb-2 block">
                    İsim <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="author_name"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    required
                    className="h-11 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <Label htmlFor="author_email" className="text-sm font-semibold mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="author_email"
                    type="email"
                    value={formData.author_email}
                    onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                    className="h-11 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="author_website" className="text-sm font-semibold mb-2 block">
                  Website (Opsiyonel)
                </Label>
                <Input
                  id="author_website"
                  type="url"
                  value={formData.author_website}
                  onChange={(e) => setFormData({ ...formData, author_website: e.target.value })}
                  className="h-11 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="content" className="text-sm font-semibold mb-2 block">
                  Yorumunuz <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={5}
                  className="border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 resize-none"
                  placeholder="Yorumunuzu buraya yazın..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length} karakter
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-design-light to-green-600 hover:from-design-dark hover:to-green-700 text-white gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Yorumu Gönder
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      author_name: "",
                      author_email: "",
                      author_website: "",
                      content: "",
                    });
                  }}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {loading ? (
        <LoadingState
          message="Yorumlar yükleniyor..."
          variant="skeleton"
          skeletonCount={3}
        />
      ) : comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Henüz yorum yok"
          description="İlk yorumu siz yapın!"
          action={
            !showForm
              ? {
                  label: "Yorum Yap",
                  onClick: () => setShowForm(true),
                  variant: "outline",
                }
              : undefined
          }
          variant="compact"
        />
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id} className="animate-slide-in-up hover-lift border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-design-light/20 to-green-500/20">
                    <User className="h-5 w-5 text-design-light" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {comment.author_name}
                      </h3>
                      {comment.author_website && (
                        <a
                          href={comment.author_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-design-light hover:text-design-dark dark:hover:text-design-light transition-colors"
                          title={`${comment.author_name}'in websitesi`}
                          aria-label={`${comment.author_name}'in websitesi`}
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Onaylandı
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {formatDate(comment.created_at)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

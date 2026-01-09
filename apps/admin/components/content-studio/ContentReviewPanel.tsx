'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Badge } from '@karasu/ui';
import { Textarea } from '@karasu/ui';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { cn } from '@karasu/lib';

interface ReviewItem {
  id: string;
  title: string;
  slug: string;
  type: 'article' | 'news';
  author: string;
  created_at: string;
  quality_score?: number;
  review_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface ContentReviewPanelProps {
  className?: string;
}

export function ContentReviewPanel({ className }: ContentReviewPanelProps) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  async function fetchPendingReviews() {
    setLoading(true);
    try {
      const response = await fetch('/api/content-review/pending');
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(action: 'approve' | 'reject') {
    if (!selectedItem) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/content-review/${selectedItem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: reviewNotes,
        }),
      });

      if (response.ok) {
        // Remove from list
        setItems(items.filter(item => item.id !== selectedItem.id));
        setSelectedItem(null);
        setReviewNotes('');
        alert(action === 'approve' ? 'İçerik onaylandı' : 'İçerik reddedildi');
      } else {
        alert('İşlem başarısız oldu');
      }
    } catch (error) {
      console.error('Error reviewing content:', error);
      alert('İşlem sırasında hata oluştu');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="h-32 bg-gray-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            İnceleme Bekleyen İçerikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>İnceleme bekleyen içerik bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-colors',
                    selectedItem?.id === item.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {item.type === 'article' ? 'Blog' : 'Haber'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleDateString('tr-TR')}
                        </span>
                        {item.quality_score !== undefined && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Skor: {item.quality_score}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.review_status === 'approved'
                          ? 'default'
                          : item.review_status === 'rejected'
                          ? 'error'
                          : 'secondary'
                      }
                      className="ml-2"
                    >
                      {item.review_status === 'pending_review' && 'İnceleme Bekliyor'}
                      {item.review_status === 'approved' && 'Onaylandı'}
                      {item.review_status === 'rejected' && 'Reddedildi'}
                      {item.review_status === 'draft' && 'Taslak'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Panel */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">İçerik İncelemesi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {selectedItem.title}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Tip: {selectedItem.type === 'article' ? 'Blog Yazısı' : 'Haber'}</p>
                <p>Yazar: {selectedItem.author}</p>
                <p>Oluşturulma: {new Date(selectedItem.created_at).toLocaleString('tr-TR')}</p>
                {selectedItem.quality_score !== undefined && (
                  <p>Kalite Skoru: {selectedItem.quality_score}/100</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İnceleme Notları
              </label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="İnceleme notlarınızı buraya yazın..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button
                onClick={() => handleReview('approve')}
                disabled={processing}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Onayla
              </Button>
              <Button
                onClick={() => handleReview('reject')}
                disabled={processing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reddet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

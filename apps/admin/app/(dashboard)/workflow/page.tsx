'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Badge } from '@karasu/ui';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText,
  Loader2,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PendingReviewsWidget } from '@/components/workflow/PendingReviewsWidget';
import { ReviewAssignmentModal } from '@/components/workflow/ReviewAssignmentModal';
import { WorkflowStatusBadge } from '@/components/workflow/WorkflowStatusBadge';

interface WorkflowStats {
  pending: number;
  approved: number;
  rejected: number;
  changesRequested: number;
  total: number;
}

interface RecentActivity {
  id: string;
  content_type: string;
  content_id: string;
  status: string;
  reviewer?: {
    name: string;
    email: string;
  };
  created_at: string;
  reviewed_at?: string;
}

export default function WorkflowDashboardPage() {
  const [stats, setStats] = useState<WorkflowStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    changesRequested: 0,
    total: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchWorkflowStats();
    fetchRecentActivity();
  }, []);

  const fetchWorkflowStats = async () => {
    try {
      const response = await fetch('/api/workflow/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching workflow stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/workflow/recent?limit=10');
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      
      const data = await response.json();
      setRecentActivity(data.activities || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      article: 'Makale',
      news: 'Haber',
      listing: 'İlan',
      page: 'Sayfa',
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'changes_requested':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            İçerik inceleme ve onay süreçlerini yönetin
          </p>
        </div>
        <Button onClick={() => setShowAssignModal(true)}>
          <Users className="h-4 w-4 mr-2" />
          İnceleme Ata
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bekleyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Onaylanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reddedilen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Değişiklik İstendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-orange-600">{stats.changesRequested}</div>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Reviews Widget */}
        <div className="lg:col-span-2">
          <PendingReviewsWidget />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Henüz aktivite bulunmuyor
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          {getContentTypeLabel(activity.content_type)}
                        </Badge>
                        <WorkflowStatusBadge 
                          status={activity.status as any} 
                          showIcon={false} 
                        />
                      </div>
                      {activity.reviewer && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {activity.reviewer.name || activity.reviewer.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          activity.reviewed_at || activity.created_at
                        ).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/content-review')}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              İnceleme Paneli
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tüm bekleyen incelemeleri görüntüleyin
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/audit-logs')}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit Logları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tüm admin aktivitelerini görüntüleyin
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowAssignModal(true)}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              İnceleme Ata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Yeni içerik için inceleme atayın
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Review Assignment Modal */}
      {showAssignModal && (
        <ReviewAssignmentModal
          open={showAssignModal}
          onOpenChange={(open) => {
            setShowAssignModal(open);
            if (!open) {
              fetchWorkflowStats();
              fetchRecentActivity();
            }
          }}
          contentType="article"
          contentId=""
          onAssigned={() => {
            setShowAssignModal(false);
            fetchWorkflowStats();
            fetchRecentActivity();
          }}
        />
      )}
    </div>
  );
}

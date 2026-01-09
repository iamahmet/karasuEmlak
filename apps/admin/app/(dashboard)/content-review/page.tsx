'use client';

import { ContentReviewPanel } from '@/components/content-studio/ContentReviewPanel';

export default function ContentReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İçerik İnceleme Paneli</h1>
        <p className="text-sm text-gray-600 mt-1">
          İnceleme bekleyen içerikleri onaylayın veya reddedin
        </p>
      </div>
      <ContentReviewPanel />
    </div>
  );
}

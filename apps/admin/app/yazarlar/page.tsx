'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthorsManagement } from '@/components/authors/AuthorsManagement';

export default function YazarlarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yazarlar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Blog yazarlarını yönetin. Yazar profilleri, uzmanlık alanları ve sosyal medya bağlantıları.
            </p>
          </div>
          <Button asChild>
            <Link href="/yazarlar/yeni">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Yazar
            </Link>
          </Button>
        </div>
      </div>

      <AuthorsManagement />
    </div>
  );
}

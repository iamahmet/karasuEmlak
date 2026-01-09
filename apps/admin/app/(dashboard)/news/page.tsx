import { Metadata } from 'next';
import { NewsManager } from './NewsManager';

export const metadata: Metadata = {
  title: 'Haber Yönetimi | Karasu Emlak Admin',
  description: 'Emlak haberlerini yönetin',
};

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Haber Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Emlak sektörü haberlerini ve güncel gelişmeleri buradan yönetebilirsiniz
          </p>
        </div>
      </div>

      <NewsManager />
    </div>
  );
}


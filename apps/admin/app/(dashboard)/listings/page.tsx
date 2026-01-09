import { Metadata } from 'next';
import { ListingsManager } from './ListingsManager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'İlan Yönetimi | Karasu Emlak Admin',
  description: 'Gayrimenkul ilanlarını yönetin',
};

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İlan Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Satılık ve kiralık gayrimenkul ilanlarını buradan yönetebilirsiniz
          </p>
        </div>
      </div>

      <ListingsManager />
    </div>
  );
}


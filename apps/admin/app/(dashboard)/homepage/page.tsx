import { Metadata } from 'next';
import { HomepageManager } from './HomepageManager';

export const metadata: Metadata = {
  title: 'Ana Sayfa Yönetimi | Karasu Emlak Admin',
  description: 'Ana sayfa içeriğini ve bölümlerini yönetin',
};

export default function HomepagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ana Sayfa Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Ana sayfa bölümlerini, içeriklerini ve görünürlüğünü buradan yönetebilirsiniz.
        </p>
      </div>

      <HomepageManager />
    </div>
  );
}


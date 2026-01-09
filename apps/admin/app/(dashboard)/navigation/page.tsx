import { Metadata } from 'next';
import { NavigationMenuManager } from './NavigationMenuManager';

export const metadata: Metadata = {
  title: 'Menü Yönetimi | Karasu Emlak Admin',
  description: 'Header ve footer menülerini yönetin',
};

export default function NavigationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Menü Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Header ve footer menülerini buradan yönetebilirsiniz. Menü öğelerini ekleyin, düzenleyin veya silin.
        </p>
      </div>

      <NavigationMenuManager />
    </div>
  );
}


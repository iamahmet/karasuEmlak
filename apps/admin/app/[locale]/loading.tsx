import { Card, CardContent } from '@karasu/ui';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Yükleniyor...</h2>
            <p className="text-sm text-muted-foreground">
              Sayfa içeriği hazırlanıyor, lütfen bekleyin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

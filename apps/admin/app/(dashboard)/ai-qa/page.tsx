import { AIQAManager } from './AIQAManager';

export default function AIQAPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Soru-Cevap Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Sayfalarda görünecek soru-cevap çiftlerini buradan yönetebilirsiniz
          </p>
        </div>
      </div>

      <AIQAManager />
    </div>
  );
}

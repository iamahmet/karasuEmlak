import Link from 'next/link';
import { Button } from '@karasu/ui';
import { ArrowRight, Calendar, Clock, FileText } from 'lucide-react';
import { cn } from '@karasu/lib';

export function Ramadan2026PromoBlock({
  basePath = '',
  className,
}: {
  basePath?: string;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        'rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/5 via-white to-blue-50/60 p-6 md:p-8 shadow-sm',
        className
      )}
      aria-label="Ramazan 2026 rehberi"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold tracking-wide uppercase text-primary/80 mb-1">Karasu Rehberi</div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Ramazan 2026: İmsakiye, İftar Vakitleri ve Pratik Rehber
          </div>
          <p className="text-gray-700 mt-2 leading-relaxed">
            Sakarya Karasu Ramazan imsakiyesi ve iftar vakitleri için güncel tabloya bakın; “Karasu iftara kaç dakika (kaç dk) kaldı” geri sayımını da buradan takip edin.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <Link href={`${basePath}/karasu/ramazan-imsakiyesi`}>
              <Button size="sm" className="gap-2">
                <Clock className="h-4 w-4" />
                Karasu İmsakiyesi
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`${basePath}/karasu/iftara-kac-dakika-kaldi`}>
              <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5 gap-2">
                <Clock className="h-4 w-4" />
                İftara Kaç Dakika Kaldı?
              </Button>
            </Link>
            <Link href={`${basePath}/blog/ramazan-2026`}>
              <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5 gap-2">
                <FileText className="h-4 w-4" />
                Ramazan 2026 Rehberi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Timer } from 'lucide-react';
import { cn } from '@karasu/lib';

type Props = {
  districtLabel: string; // e.g. "Sakarya / Karasu"
  targetLabel: string; // e.g. "İftar (Akşam)"
  targetTimeText: string; // e.g. "18:38"
  targetUtcMs: number;
  nextTargetUtcMs?: number;
  className?: string;
};

function format2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s, text: `${h}:${format2(m)}:${format2(s)}` };
}

export function IftarCountdown({
  districtLabel,
  targetLabel,
  targetTimeText,
  targetUtcMs,
  nextTargetUtcMs,
  className,
}: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeTarget = useMemo(() => {
    if (now <= targetUtcMs) return { ms: targetUtcMs, isNext: false };
    if (nextTargetUtcMs && now <= nextTargetUtcMs) return { ms: nextTargetUtcMs, isNext: true };
    return { ms: targetUtcMs, isNext: false };
  }, [now, targetUtcMs, nextTargetUtcMs]);

  const diff = activeTarget.ms - now;
  const isPassed = diff <= 0 && !activeTarget.isNext;
  const d = formatDuration(diff);

  const headline = isPassed
    ? 'İftar saati geçti'
    : activeTarget.isNext
      ? 'Bugünkü iftar geçti, yarın için geri sayım'
      : 'İftara kaç dakika kaldı?';

  const minuteOnly = isPassed ? null : Math.max(0, Math.ceil(diff / 60000));

  return (
    <section
      className={cn(
        'rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary/5 via-white to-blue-50/60 dark:from-primary/10 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8 shadow-sm',
        className
      )}
      aria-label="İftar geri sayımı"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Timer className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold tracking-wide uppercase text-primary/80 dark:text-primary/70 mb-1">{districtLabel}</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{headline}</h2>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            {targetLabel} saati: <span className="font-semibold">{targetTimeText}</span>
            <span className="text-gray-500 dark:text-gray-400"> (Karasu)</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 min-h-[72px] flex flex-col justify-center">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Geri Sayım</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{isPassed ? '00:00:00' : d.text}</div>
        </div>

        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 min-h-[72px] flex flex-col justify-center">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Dakika</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            {minuteOnly === null ? '-' : `${minuteOnly} dk`}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Karasu iftara kaç dakika kaldı</div>
        </div>

        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:col-span-2 md:col-span-1">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Not</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Saatler gün gün değişir. Bu sayfada Sakarya Karasu iftar vakitleri ve geri sayım aynı kaynaktan hesaplanır.
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Sakarya Karasu iftara kaç dk kaldı</span>
          </div>
        </div>
      </div>
    </section>
  );
}


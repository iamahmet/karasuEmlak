'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@karasu/ui';
import { X, Filter } from 'lucide-react';
import { ListingFilters } from './ListingFilters';
import { Button } from '@karasu/ui';

interface MobileFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  neighborhoods: string[];
}

export function MobileFiltersSheet({
  open,
  onOpenChange,
  neighborhoods,
}: MobileFiltersSheetProps) {
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-full h-[90vh] max-h-[90vh] p-0 flex flex-col md:hidden"
        aria-describedby="mobile-filters-description"
      >
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-slate-200/80 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#006AFF]/10 rounded-lg">
                <Filter className="h-5 w-5 text-[#006AFF]" strokeWidth={2.5} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                  Filtreler
                </DialogTitle>
                <DialogDescription
                  id="mobile-filters-description"
                  className="text-sm text-slate-600 mt-0.5"
                >
                  İlanları filtreleyin
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 rounded-lg"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ListingFilters neighborhoods={neighborhoods} />
        </div>

        <div className="border-t border-slate-200/80 px-4 py-4 bg-slate-50/50 flex-shrink-0 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl font-semibold text-slate-700 border-slate-300"
            onClick={() => {
              // Reset filters logic here
              window.location.href = window.location.pathname;
            }}
          >
            Temizle
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl font-semibold bg-[#006AFF] hover:bg-[#0052CC] text-white"
            onClick={() => onOpenChange(false)}
          >
            Uygula
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

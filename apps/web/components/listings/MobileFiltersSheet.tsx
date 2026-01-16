'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@karasu/ui';
import { X, Filter } from 'lucide-react';
import { ListingFilters, type ListingFilters as ListingFiltersType } from './ListingFilters';
import { Button } from '@karasu/ui';
import { useRouter } from 'next/navigation';
import { triggerHaptic } from '@/lib/mobile/haptics';

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
  const router = useRouter();
  const filtersRef = useRef<ListingFiltersType>({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleFiltersChange = (filters: ListingFiltersType) => {
    filtersRef.current = filters;
    setHasChanges(true);
  };

  const handleClear = () => {
    triggerHaptic('medium');
    filtersRef.current = {};
    setHasChanges(false);
    router.push(window.location.pathname);
    onOpenChange(false);
  };

  const handleApply = () => {
    triggerHaptic('success');
    // Filters are already applied via URL updates in ListingFilters component
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    triggerHaptic('light');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <AnimatePresence>
        {open && (
          <DialogContent
            className="max-w-full h-[90vh] max-h-[90vh] p-0 flex flex-col md:hidden rounded-t-3xl rounded-b-none bottom-0 top-auto left-0 right-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
            aria-describedby="mobile-filters-description"
            style={{ touchAction: 'manipulation' }}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="w-full h-full flex flex-col bg-white rounded-t-3xl overflow-hidden"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150) {
                  handleClose();
                }
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <motion.div
                  className="w-12 h-1.5 bg-slate-300 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />
              </div>

              <DialogHeader className="px-4 pt-2 pb-2 border-b border-slate-200/80 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-2 bg-[#006AFF]/10 rounded-lg"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Filter className="h-5 w-5 text-[#006AFF]" strokeWidth={2.5} />
                    </motion.div>
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
                    onClick={handleClose}
                    className="h-10 w-10 rounded-lg min-h-[44px] min-w-[44px] touch-manipulation"
                    aria-label="Kapat"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </DialogHeader>

              <motion.div
                className="flex-1 overflow-y-auto px-4 py-4 overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ListingFilters 
                  neighborhoods={neighborhoods} 
                  onFiltersChange={handleFiltersChange}
                />
              </motion.div>

              <motion.div
                className="border-t border-slate-200/80 px-4 py-4 bg-slate-50/50 flex-shrink-0 flex gap-3 safe-area-inset-bottom backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  className="flex-1 h-12 min-h-[48px] rounded-xl font-semibold text-slate-700 border-slate-300 touch-manipulation active:scale-95"
                  onClick={handleClear}
                  style={{ touchAction: 'manipulation' }}
                >
                  Temizle
                </Button>
                <Button
                  className="flex-1 h-12 min-h-[48px] rounded-xl font-semibold bg-[#006AFF] hover:bg-[#0052CC] text-white touch-manipulation active:scale-95"
                  onClick={handleApply}
                  style={{ touchAction: 'manipulation' }}
                >
                  Uygula
                </Button>
              </motion.div>
              </motion.div>
            </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

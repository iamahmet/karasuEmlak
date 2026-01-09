'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'var(--background)',
          border: '1px solid var(--border)',
        },
        className: 'toast',
      }}
    />
  );
}

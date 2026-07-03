'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from '@/lib/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  }));
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

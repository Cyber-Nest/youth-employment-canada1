'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { Suspense, lazy, useMemo, type ReactNode } from 'react';
import CookieBannerErrorBoundary from '@/components/CookieBannerErrorBoundary';
import Header from '@/layouts/parts/Header';
import Footer from '@/layouts/parts/Footer';
import Website from '@/layouts/Website';

const CookieBanner = lazy(() =>
  import('@/components/CookieBanner').catch(() => ({ default: () => null })),
);

export default function ClientLayout({ children }: { children: ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
    [],
  );

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Website>
          <Header />
          {children}
          <Footer />
        </Website>
        <CookieBannerErrorBoundary>
          <Suspense fallback={null}>
            <CookieBanner />
          </Suspense>
        </CookieBannerErrorBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

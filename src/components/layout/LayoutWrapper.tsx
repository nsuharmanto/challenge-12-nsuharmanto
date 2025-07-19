'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/container/Container';
import Loading from '@/app/loading';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/register' || pathname === '/login';
  const isWritePostPage = pathname === '/write-post';
  const isEditPostPage = pathname.startsWith('/edit-post');
  const router = useRouter();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setRouteLoading(true);
    const handleComplete = () => setRouteLoading(false);

    // @ts-expect-error: next/navigation router.events is not typed in app router, but works for route change
    router.events?.on('routeChangeStart', handleStart);
    // @ts-expect-error: next/navigation router.events is not typed in app router, but works for route change
    router.events?.on('routeChangeComplete', handleComplete);
    // @ts-expect-error: next/navigation router.events is not typed in app router, but works for route change
    router.events?.on('routeChangeError', handleComplete);

    return () => {
      // @ts-expect-error: next/navigation router.events is not typed in app router, but works for route change
      router.events?.off('routeChangeStart', handleStart);
      // @ts-expect-error: next/navigation router.events is not typed in app router, but works for route change
      router.events?.off('routeChangeComplete', handleComplete);
      // @ts-expect-error: next/navigation router.events is not typed in app router, but works for route change
      router.events?.off('routeChangeError', handleComplete);
    };
  }, [router]);
  
  if (isAuthPage || isWritePostPage || isEditPostPage) {
    return <>{children}</>;
  }

  return (
  <div className="flex flex-col min-h-screen">
    <Header
      searchQuery=""
      onSearch={(query: string) => {
        router.push(`/?query=${encodeURIComponent(query)}`);
      }}
    />
    <main className="flex-1 flex items-center justify-center">
      <Container>
        {routeLoading ? <Loading /> : children}
      </Container>
    </main>
    <Footer />
  </div>
);
}
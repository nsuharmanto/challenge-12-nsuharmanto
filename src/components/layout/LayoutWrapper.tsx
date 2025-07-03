'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/container/Container';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/register' || pathname === '/login';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
      <Container>
        {children}
      </Container>
    </main>
    <Footer />
  </div>
);
}
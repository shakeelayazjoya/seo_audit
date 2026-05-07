'use client';

import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { PublicFooter } from '@/components/marketing/PublicFooter';
import { PublicHeader } from '@/components/marketing/PublicHeader';

export function MarketingShell({ children }: PropsWithChildren<{}>) {
  const pathname = usePathname() ?? '';
  const cleanedPath = pathname.replace(/\/+$/, '');

  if (
    cleanedPath.startsWith('/admin') ||
    cleanedPath === '/login' ||
    cleanedPath === '/signup'
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
  );
}

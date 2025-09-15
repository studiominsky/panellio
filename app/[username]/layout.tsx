'use client';

import { ReactNode, Suspense } from 'react';
import DirectoryList from '@/components/directory-list';
import { useAuth } from '@/context/auth-context';
import { DirectoryProvider } from '@/context/dir-context';
import Header from '@/components/header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SidebarWidgets from '@/components/chat-widget';

interface LayoutProps {
  children: ReactNode;
}

function AuthContent({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <>
      <DirectoryList />
      <main className="flex flex-col h-full">{children}</main>
      <SidebarWidgets />
    </>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { loading } = useAuth();

  return (
    <TooltipProvider>
      <DirectoryProvider>
        <Header />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <AuthContent>{children}</AuthContent>
        )}
      </DirectoryProvider>
    </TooltipProvider>
  );
}

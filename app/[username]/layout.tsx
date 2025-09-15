'use client';

import { ReactNode } from 'react';
import DirectoryList from '@/components/directory-list';
import { useAuth } from '@/context/auth-context';
import { DirectoryProvider } from '@/context/dir-context';
import Header from '@/components/header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useValidateUsername } from '@/hooks/use-validate-username'; // Custom hook for validation
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SidebarWidgets from '@/components/chat-widget';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const { isValidUsername, isLoadingValidation } =
    useValidateUsername();

  if (loading || isLoadingValidation) {
    return <LoadingSpinner />;
  }

  if (!user || !isValidUsername) {
    return null;
  }

  return (
    <TooltipProvider>
      <DirectoryProvider>
        <Header />
        {user && <DirectoryList />}
        <main className="flex flex-col h-full">{children}</main>
        <SidebarWidgets />
      </DirectoryProvider>
    </TooltipProvider>
  );
}

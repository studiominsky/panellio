'use client';

import React, { useEffect } from 'react';
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
} from 'next-themes';
import { useAuth } from '@/context/auth-context';

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user, setTheme]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

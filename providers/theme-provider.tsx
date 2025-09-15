'use client';

import * as React from 'react';
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
} from 'next-themes';
import { useAuth } from '@/context/auth-context';

type Props = { children: React.ReactNode };

function UserThemeSync() {
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!user?.theme) return;
    if (user.theme !== resolvedTheme) {
      setTheme(user.theme);
    }
  }, [user?.theme, resolvedTheme, setTheme]);

  return null;
}

export function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserThemeSync />
      {children}
    </NextThemesProvider>
  );
}

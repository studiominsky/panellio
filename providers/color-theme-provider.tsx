// providers/color-theme-provider.tsx

'use client';

import { useState, useEffect } from 'react';
import { useColorTheme } from '@/hooks/use-color-theme';
import { merge } from '@/utils/merge-classes';

import '@/styles/themes.css';

interface ColorThemeProviderProps {
  children: React.ReactNode;
  className?: string;
}

export function ColorThemeProvider({
  children,
  className,
}: ColorThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [colorTheme] = useColorTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <div
        className={merge(
          colorTheme ? `color-theme-${colorTheme}` : '',
          className
        )}
      >
        {children}
      </div>
    )
  );
}

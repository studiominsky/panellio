import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ColorThemeProvider } from '@/providers/color-theme-provider';
import { TimeFormatProvider } from '@/context/time-format-context';
import { DataProvider } from '@/context/data-context';
import { DirectoryProvider } from '@/context/dir-context';

import '../styles/globals.css';
import '../styles/custom.css';

export const metadata: Metadata = {
  title: 'Panellio - Redirect your focus to what matters',
  description:
    'A personal management set of tools designed to help you organize your online life, reduce distractions, and boost productivity in a systematic way. Try it today.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AuthProvider>
          <TimeFormatProvider>
            <ThemeProvider>
              <ColorThemeProvider className="h-full">
                <DirectoryProvider>
                  <DataProvider>{children}</DataProvider>
                </DirectoryProvider>
              </ColorThemeProvider>
              <Toaster />
            </ThemeProvider>
          </TimeFormatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, MessageSquare, Settings, X } from 'lucide-react';
import Link from 'next/link';
import Logo from './logo';
import ThemeSelector from './theme-selector';
import { ColorThemeSelector } from './color-theme-selector';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { useColorTheme } from '@/hooks/use-color-theme';
import { useTheme } from 'next-themes';

const MobileMenu = ({
  onSettingsClick,
  onFeedbackClick,
}: {
  onSettingsClick: () => void;
  onFeedbackClick: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [colorTheme, setColorTheme] = useColorTheme();
  const { resolvedTheme } = useTheme();
  const [themeOnOpen, setThemeOnOpen] = useState<string | undefined>();

  const navLinks = [
    { href: '/story', label: 'Story' },
    { href: '/resources', label: 'Resources' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/support', label: 'Support' },
  ];

  useEffect(() => {
    if (isOpen) {
      setThemeOnOpen(resolvedTheme);
    }
  }, [isOpen, resolvedTheme]);

  useEffect(() => {
    if (isOpen && themeOnOpen && resolvedTheme !== themeOnOpen) {
      setIsOpen(false);
    }
  }, [resolvedTheme, isOpen, themeOnOpen]);


  const handleColorSelect = (color: string) => {
    setColorTheme(color);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex items-center justify-between">
            <Logo />
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-6 w-6" />
              </Button>
            </SheetClose>
          </div>

          <nav className="mt-8">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg hover:text-foreground ${pathname === link.href
                      ? 'text-foreground font-bold'
                      : 'text-foreground font-medium'
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="absolute bottom-8 left-6 right-6 space-y-4">
            <div className="mt-8 border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground/80 text-sm font-medium">
                  Theme
                </span>
                <ThemeSelector />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/80 text-sm font-medium">
                  Accent Color
                </span>
                <ColorThemeSelector
                  selectedColor={colorTheme}
                  onSelectColor={handleColorSelect}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {user ? (
                <>
                  <Button asChild className="w-full">
                    <Link
                      href={`/${user.username}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Go to Panellio
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSettingsClick();
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onFeedbackClick();
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Feedback
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout();
                      toast({
                        title: 'Logged out',
                        description:
                          'You have been logged out. See you soon.',
                      });
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full">
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;
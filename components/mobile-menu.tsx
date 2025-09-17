'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import Logo from './logo';
import ThemeSelector from './theme-selector';
import { ColorThemeSelector } from './color-theme-selector';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { useColorTheme } from '@/hooks/use-color-theme';

const MobileMenu = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [colorTheme, setColorTheme] = useColorTheme();

  const navLinks = [
    { href: '/story', label: 'Story' },
    { href: '/resources', label: 'Resources' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <nav className="mt-8">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-lg hover:text-foreground ${
                      pathname === link.href
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
                  onSelectColor={setColorTheme}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {user ? (
                <>
                  <Button asChild className="w-full">
                    <Link href={`/${user.username}`}>
                      Go to Panellio
                    </Link>
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
                    }}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full"
                  >
                    <Link href="/login">Log In</Link>
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

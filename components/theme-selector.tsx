'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { useAuth } from '@/context/auth-context';

const ThemeSelector = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, updateTheme } = useAuth();

  useEffect(() => {
    setMounted(true);
    if (user && user.theme) {
      setTheme(user.theme);
    }
  }, [user, setTheme]);

  const handleThemeChange = async (selectedTheme: string) => {
    setTheme(selectedTheme);

    if (user) {
      try {
        await updateTheme(selectedTheme);
      } catch (error) {
        console.error('Error updating theme in database:', error);
      }
    }
  };

  if (!mounted) return null;

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger variant="outline">Theme</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup
            value={theme}
            onValueChange={handleThemeChange}
          >
            <MenubarRadioItem value="light">
              Light theme
            </MenubarRadioItem>
            <MenubarRadioItem value="dark">
              Dark theme
            </MenubarRadioItem>
            <MenubarRadioItem value="system">
              System theme
            </MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default ThemeSelector;

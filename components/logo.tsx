'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

const Logo = () => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <span className="flex items-center">
      {theme === 'dark' ? (
        <Image
          src="/logo-dark.svg"
          alt="Panellio Logo"
          width={120}
          height={40}
          priority
        />
      ) : (
        <Image
          src="/logo-light.svg"
          alt="Panellio Logo"
          width={120}
          height={40}
          priority
        />
      )}
    </span>
  );
};

export default Logo;

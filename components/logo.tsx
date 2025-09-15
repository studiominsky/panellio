'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link href="/" scroll={false}>
        <span
          className="flex items-center"
          style={{ width: 120, height: 40 }}
        />
      </Link>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <Link href="/" scroll={false}>
      <span className="flex items-center">
        {currentTheme === 'dark' ? (
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
    </Link>
  );
};

export default Logo;

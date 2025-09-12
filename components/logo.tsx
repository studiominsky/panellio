'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  const { theme } = useTheme();

  return (
    <Link href="/" scroll={false}>
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
    </Link>
  );
};

export default Logo;

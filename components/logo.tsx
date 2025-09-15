'use client';

import Image from 'next/image';

const Logo = () => {
  return (
    <span className="flex items-center">
      <Image
        src="/logo-light.svg"
        alt="Panellio Logo"
        width={120}
        height={40}
        priority
        className="block dark:hidden"
      />
      <Image
        src="/logo-dark.svg"
        alt="Panellio Logo"
        width={120}
        height={40}
        priority={false}
        className="hidden dark:block"
      />
    </span>
  );
};

export default Logo;

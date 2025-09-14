'use client';

import Link from 'next/link';
import Wide from '@/containers/wide';

import styles from '../styles/components/Logo.module.css';
import Logo from './logo';
import { Mail } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex-0 text-start text-sm border-t border-border">
      <Wide>
        <div className="flex pt-10 gap-4 items-center justify-between ">
          <div>
            <Logo />
            <span className="block mt-3 text-foreground/60 max-w-[300px]">
              This website does not store any personal information. We
              use cookies to provide you with a great experience and
              to help our website run effectively.
            </span>
            <span className="flex items-center gap-2 text-[--ui-primary] mt-3">
              <span className="w-3 h-3 bg-[--ui-primary] rounded-full transition duration-300"></span>
              <span>All systems functional</span>
            </span>
          </div>
          <nav className="hidden md:flex">
            <ul className="flex flex-col gap-4 items-start">
              <li>
                <Link
                  href="/story"
                  className="text-sm text-foreground/60 hover:text-inverted"
                >
                  Story
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-sm text-foreground/60 hover:text-inverted"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-foreground/60 hover:text-inverted"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-foreground/60 hover:text-inverted"
                >
                  Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Wide>

      <span className="flex py-9 justify-center align-center mt-auto">
        {currentYear} © Panellio. All rights reserved.
      </span>
    </footer>
  );
}

export default Footer;

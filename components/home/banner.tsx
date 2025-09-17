'use client';

import { Badge } from '@/components/ui/badge';
import { ChevronRight, CodeXml } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import Mac from './mac';
import Wide from '@/containers/wide';
import { useAuth } from '@/context/auth-context';

import styles from '../../styles/components/Banner.module.css';

function Banner() {
  const { user, loading } = useAuth();

  return (
    <div className={styles.banner}>
      <Wide>
        <div className="py-[35px] text-center md:pt-[100px] md:pb-[45px]">
          <Badge
            variant="outline"
            className="mb-1 py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          >
            Version 1.0 <CodeXml className="w-4 h-4 ml-2" />
          </Badge>
          <h1 className="text-[40px] font-bold mx-auto leading-[1] md:text-[75px]">
            Redirect your focus to what matters
          </h1>
          <p className=" max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
            A personal management set of tools designed to help you
            organize your online life, reduce distractions, and boost
            productivity in a systematic way. Try it today.
          </p>
          <div className="flex justify-center gap-3 mt-5">
            {!loading && user && (
              <Button asChild name="Dashboard">
                <Link href={`/${user.username}`}>
                  Go to Panellio{' '}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}

            {!loading && !user && (
              <Button asChild name="Sign Up">
                <Link href="/signup">
                  Get Started{' '}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button variant="outline" asChild name="Log In">
              <Link href="/story">Read the story</Link>
            </Button>
          </div>
        </div>
        <Mac />
      </Wide>
    </div>
  );
}

export default Banner;

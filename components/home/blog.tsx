'use client';

import { ChevronRight, SquarePen } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';
import Wide from '@/containers/wide';

function Blog() {
  return (
    <Wide>
      <div className="my-[75px] lg:my-[170px]">
        <div className="flex flex-col gap-1 items-center justify-between ">
          <Badge
            variant="outline"
            className="py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          >
            Blog posts <SquarePen className="w-4 h-4 ml-2" />
          </Badge>
          <h2 className="text-center max-w-[680px] text-[35px] md:text-[45px] font-bold leading-tight">
            Get inspired by latest articles and resources
          </h2>
          <div className="flex flex-col justify-between mt-10 gap-5 w-full md:flex-row">
            <div className="flex flex-col w-full border bg-card border-border rounded-xl cursor-pointer p-6 md:p-8 transition duration-300 hover:border-[--ui-primary] md:w-1/3">
              <Badge
                variant="outline"
                className="py-1 w-fit border-none bg-[--ui-soft] text-black dark:text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
              >
                Inspiration
              </Badge>
              <span className="text-2xl mt-2 font-semibold">
                Gamification method in personal development
              </span>
              <span className="mt-2 text-foreground/60">
                Learn how methods like gamification can help you stay
                motivated and reach your goals faster.
              </span>
              <span className="text-sm font-semibold flex items-center mt-5">
                <span>Read more</span>{' '}
                <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            </div>
            <div className="flex flex-col w-full border bg-card border-border rounded-xl cursor-pointer p-6 md:p-8 transition duration-300 hover:border-[--ui-primary] md:w-1/3">
              <Badge
                variant="outline"
                className="py-1 w-fit border-none bg-[--ui-soft] text-black dark:text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
              >
                Inspiration
              </Badge>
              <span className="text-2xl mt-2 font-semibold">
                Why New Year’s resolutions don’t work
              </span>
              <span className="mt-2 text-foreground/60">
                Learn how methods like gamification can help you stay
                motivated and reach your goals faster.
              </span>
              <span className="text-sm font-semibold flex items-center mt-5">
                <span>Read more</span>{' '}
                <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            </div>
            <div className="flex flex-col w-full border bg-card border-border rounded-xl cursor-pointer p-6 md:p-8 transition duration-300 hover:border-[--ui-primary] md:w-1/3">
              <Badge
                variant="outline"
                className="py-1 w-fit border-none bg-[--ui-soft] text-black dark:text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
              >
                Updates
              </Badge>
              <span className="text-2xl mt-2 font-semibold">
                Changes in version 1.0.3
              </span>
              <span className="mt-2 text-foreground/60">
                Get informed about the latest changes and updates in
                the Panellio application including bug fixes, new
                features, and more.
              </span>
              <span className="text-sm font-semibold flex items-center mt-5">
                <span>Read more</span>{' '}
                <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            </div>
          </div>
          <Button
            variant="link"
            name="Log into Panellio"
            className="w-[300px] mx-auto mt-3"
          >
            <Link href="/resources">Discover more articles</Link>
          </Button>
        </div>
      </div>
    </Wide>
  );
}

export default Blog;

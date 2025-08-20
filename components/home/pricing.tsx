'use client';

import {
  Blocks,
  Box,
  Boxes,
  ChevronRight,
  CircleCheckBig,
  CircleX,
  Crown,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';
import Wide from '@/containers/wide';

function Pricing() {
  return (
    <Wide>
      <div className="my-[75px] md:my-[100px] lg:my-[170px]">
        <div className="flex flex-col gap-1 items-center justify-between ">
          <Badge
            variant="outline"
            className="py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          >
            Pricing models <Blocks className="w-4 h-4 ml-2" />
          </Badge>
          <h2 className="text-center max-w-[780px] text-[35px] md:text-[45px] font-bold leading-tight">
            Use it for free with limits, or unlock all features paid
            versions
          </h2>
          <div className="flex flex-col justify-between mt-10 gap-5 w-full lg:flex-row md:mt-20">
            <div className="flex flex-col w-full border bg-card border-border rounded-xl p-6 md:p-8 lg:w-1/3">
              <span className="text-4xl font-bold flex items-center gap-2">
                <Box size={30} />
                <span>Core</span>
              </span>
              <p className="text-md mt-3 text-foreground/60">
                Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Sed a nisl nec nunc. Nullam sit amet nisi.
              </p>
              <span className="flex items-end gap-3 mt-3">
                <span className="text-3xl font-bold text-[--ui-primary] relative top-[3px]">
                  Free forever
                </span>
              </span>
              <Button
                variant="outline"
                asChild
                name="Sign Up"
                className="mt-4"
              >
                <Link href="/signup">
                  Get started for free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <span className="my-4 text-foreground/60">
                Core model includes:
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                Basic functionality
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                Core features
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                Maximum 3 directories
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleX size={20} />
                No space for storing files
              </span>
            </div>
            <div className="flex flex-col w-full  border bg-card border-[--ui-primary] rounded-xl p-6 md:p-8 lg:w-1/3 lg:mt-[-30px]">
              <span className="text-4xl font-bold flex items-center gap-2">
                <Boxes size={30} />
                <span>Pro</span>
              </span>
              <p className="text-md mt-3 text-foreground/60">
                Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Sed a nisl nec nunc. Nullam sit amet nisi.
              </p>
              <span className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-bold text-[--ui-primary] relative top-[3px]">
                  1.29€
                </span>
                <span className="text-sm">per month</span>
              </span>
              <Button asChild name="Sign Up" className="mt-4">
                <Link href="/signup">
                  Get started for free{' '}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <span className="my-4 text-foreground/60">
                Pro model includes:
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                Full functionality
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                All features unlocked
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                Unlimited directories
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                100Mb for storing files
              </span>
            </div>
            <div className="flex flex-col w-full border bg-card border-border rounded-xl p-6 md:p-8 lg:w-1/3">
              <span className="text-4xl font-bold flex items-center gap-2">
                <Crown size={30} />
                <span>Premium</span>
              </span>
              <p className="text-md mt-3 text-foreground/60">
                Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Sed a nisl nec nunc. Nullam sit amet nisi.
              </p>
              <span className="flex items-baseline gap-3 mt-3">
                <span className="text-4xl font-bold text-[--ui-primary] relative top-[3px]">
                  3.29€
                </span>
                <span className="text-sm">per month</span>
              </span>
              <Button
                variant="outline"
                asChild
                name="Sign Up"
                className="mt-4"
              >
                <Link href="/signup">
                  Get started for free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <span className="my-4 text-foreground/60">
                Premium model includes:
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                Full functionality
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                All features unlocked
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                Unlimited directories
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                500Mb for storing files
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                Experimental features included
              </span>
              <span className="flex items-center gap-2 mb-2">
                <CircleCheckBig size={20} />
                AI included
              </span>
            </div>
          </div>
        </div>
      </div>
    </Wide>
  );
}

export default Pricing;

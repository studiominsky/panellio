'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { merge } from '@/utils/merge-classes';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    dir="rtl"
    className={merge(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      style={{
        background:
          'linear-gradient(to right, rgb(var(--green-500-rgb)), rgb(var(--blue-500-rgb)), rgb(var(--orange-500-rgb)))',
      }}
      className="relative h-2 w-full overflow-hidden rounded-full"
    >
      <SliderPrimitive.Range className="absolute left-0 top-0 h-full bg-muted ease-in-out" />
    </SliderPrimitive.Track>

    <SliderPrimitive.Thumb
      className="block cursor-grab h-5 w-5 rounded-full border-2 border-neutral-900 bg-white transition-all
                 duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none
                 disabled:opacity-50 dark:border-neutral-50 dark:bg-neutral-950 dark:ring-offset-neutral-950
                 dark:focus-visible:ring-neutral-300"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

// components/ui/button.tsx

'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps } from 'class-variance-authority';
import { merge } from '@/utils/merge-classes';
import { sharedVariants } from './variants';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sharedVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={merge(
          sharedVariants({ variant, size }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export type { ButtonProps };
export { Button, sharedVariants as buttonVariants };

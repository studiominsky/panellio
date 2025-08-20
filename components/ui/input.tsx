import * as React from 'react';

import { merge } from '@/utils/merge-classes';
import { ColorThemeProvider } from '@/providers/color-theme-provider';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <ColorThemeProvider className="w-full">
        <input
          type={type}
          className={merge(
            `
              flex h-10 w-full rounded-md border border-border bg-card 
              duration-200 ease transition-colors
              px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground
              focus-visible:outline-none focus-visible:border-[var(--ui-primary)]
              hover:ring-[var(--ui-primary)] focus-visible:ring-[--ui-primary]
              disabled:cursor-not-allowed disabled:opacity-50
              file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
              hover:border-[--ui-primary]
            `,
            className
          )}
          ref={ref}
          {...props}
        />
      </ColorThemeProvider>
    );
  }
);
Input.displayName = 'Input';

export { Input };

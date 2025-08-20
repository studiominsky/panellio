import * as React from 'react';

import { merge } from '@/utils/merge-classes';
import { ColorThemeProvider } from '@/providers/color-theme-provider';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <ColorThemeProvider>
        <textarea
          className={merge(
            'flex min-h-[80px] w-full rounded-md border border-input duration-200 ease transition-colors bg-card px-3 py-2 text-sm ring-offset-background focus-visible:border-[--ui-primary] focus-visible:ring-[--ui-primary] hover:border-[--ui-primary]  placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
      </ColorThemeProvider>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

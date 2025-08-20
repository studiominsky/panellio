import { cva } from 'class-variance-authority';

export const sharedVariants = cva(
  'inline-flex items-center justify-center transition duration-300 rounded-md text-sm font-medium cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
        primary:
          'bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:text-white dark:hover:bg-red-800',
        secondary:
          'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        dark: 'bg-slate-800 text-slate-50 hover:bg-slate-800/90 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-800/90',
        light:
          'bg-slate-200 text-slate-900 hover:bg-slate-300/80 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-100/80',
        action:
          'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800',
        outline:
          'border border-border bg-white hover:bg-accent hover:text-slate-900 dark:bg-slate-950 dark:hover:bg-accent dark:hover:text-slate-50',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-accent dark:hover:text-slate-50',
        ellipsis:
          'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
        link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
        destructiveLink:
          'text-red-500 underline-offset-4 hover:underline',
        folder: 'border-none h-unset !p-0',
        emoji: 'bg-transparent border border-border',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-10  px-3',
        lg: 'h-11  px-8',
        icon: 'h-7 w-7 border-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

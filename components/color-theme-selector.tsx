'use client';

import { Button } from '@/components/ui/button';
import { merge } from '@/utils/merge-classes';

interface ColorThemeSelectorProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorThemeSelector({
  selectedColor,
  onSelectColor,
}: ColorThemeSelectorProps) {
  return (
    <div className="flex gap-1 items-center justify-start">
      <Button
        size="icon"
        variant="outline"
        className={merge(
          'border-none flex items-center justify-center w-8 h-8 px-1 rounded-full',
          selectedColor === 'green' && 'border-green-500'
        )}
        onClick={() => onSelectColor('green')}
      >
        <div className="flex items-center bg-green-500 w-5 h-5 rounded-full">
          {selectedColor === 'green' && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[--theme-primary]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
              >
                <path
                  d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                  fill="currentColor"
                ></path>
              </svg>
            </span>
          )}
        </div>
        <span className="sr-only">Green theme</span>
      </Button>

      {/* Blue Theme */}
      <Button
        size="icon"
        variant="outline"
        className={merge(
          'border-none flex items-center justify-center w-8 h-8 px-1 rounded-full',
          selectedColor === 'blue' && 'border-blue-500'
        )}
        onClick={() => onSelectColor('blue')}
      >
        <div className="flex items-center bg-blue-500 w-5 h-5 rounded-full">
          {selectedColor === 'blue' && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[--theme-primary]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
              >
                <path
                  d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                  fill="currentColor"
                ></path>
              </svg>
            </span>
          )}
        </div>
        <span className="sr-only">Blue theme</span>
      </Button>

      {/* Orange Theme */}
      <Button
        size="icon"
        variant="outline"
        className={merge(
          'border-none flex items-center justify-center w-8 h-8 px-1 rounded-full',
          selectedColor === 'orange' && 'border-orange-500'
        )}
        onClick={() => onSelectColor('orange')}
      >
        <div className="flex items-center bg-orange-500 w-5 h-5 rounded-full">
          {selectedColor === 'orange' && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[--theme-primary]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
              >
                <path
                  d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                  fill="currentColor"
                ></path>
              </svg>
            </span>
          )}
        </div>
        <span className="sr-only">Orange theme</span>
      </Button>
    </div>
  );
}

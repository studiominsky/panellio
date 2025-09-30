'use client';

import { merge } from '@/utils/merge-classes';
import * as React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
}) => {
  return (
    <div
      className={merge(
        'absolute inset-0 flex items-center justify-center',
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-spin stroke-neutral-800 dark:stroke-neutral-200"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
};
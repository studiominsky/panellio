'use client';

import React from 'react';
import { merge } from '@/utils/merge-classes';

interface DifficultyBarProps {
  value: number;
  className?: string;
}

const DifficultyBar: React.FC<DifficultyBarProps> = ({
  value,
  className,
}) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={merge(
        'relative h-2 w-full rounded-full overflow-hidden border border-border',
        className
      )}
      style={{
        background:
          'linear-gradient(to right, rgb(var(--green-500-rgb)), rgb(var(--blue-500-rgb)), rgb(var(--orange-500-rgb)))',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: `${0 + percentage}%`,
          backgroundColor: 'hsl(var(--card))',
          transition: 'width 150ms ease-in-out',
        }}
      />
    </div>
  );
};

export { DifficultyBar };

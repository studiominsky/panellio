'use client';

import React from 'react';
import HabitItem from './habit-item';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Habit } from '@/types/habit-types';

interface HabitListProps {
  habits: Habit[];
  directoryId: string;
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  loading?: boolean;
  width: number;
  height: number;
}

export default function HabitList({
  habits,
  directoryId,
  setHabits,
  width,
  height,
  loading = false,
}: HabitListProps) {
  if (loading) {
    return (
      <div
        style={{ height: `calc(100% - 2rem)` }}
        className="relative overflow-auto p-4 h-full border-l border-r border-b border-border bg-card flex items-center justify-center"
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div
        style={{ height: `calc(100% - 2rem)` }}
        className="overflow-auto p-4 h-full border-l border-r border-b border-border bg-card"
      >
        <div className="py-1 pt-4 flex flex-wrap gap-8">
          <p className="text-sm text-muted-foreground">
            No habits added yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height: `calc(100% - 2rem)` }}
      className="overflow-auto p-4 h-full border-l border-r border-b border-border bg-card"
    >
      <ul className="flex flex-col gap-7">
        {habits.map((habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            directoryId={directoryId}
            setHabits={setHabits}
            width={width}
            height={height}
          />
        ))}
      </ul>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import clsx from 'clsx';
import { Loader } from 'lucide-react';
import { Habit } from '@/types/habit-types';

interface EditHabitFormProps {
  habit: Habit;
  onUpdate: (
    updatedHabit: Omit<Habit, 'id' | 'days' | 'createdAt'>
  ) => void;
  onCancel: () => void;
}

export default function EditHabitForm({
  habit,
  onUpdate,
}: EditHabitFormProps) {
  const [name, setName] = useState(habit.name);
  const [duration, setDuration] = useState<number>(habit.duration);
  const [startDate, setStartDate] = useState<Date | null>(
    habit.startDate
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = () => {
    if (isSubmitting) return;

    const trimmedName = name.trim();

    if (trimmedName === '' || !startDate || duration <= 0) {
      toast({
        title: 'Invalid Input',
        description:
          'Please provide a valid name, duration, and start date.',
        variant: 'destructive',
      });
      return;
    }

    if (duration > 365) {
      toast({
        title: 'Duration Too Long',
        description: 'Duration cannot exceed 365 days.',
        variant: 'destructive',
      });
      return;
    }

    const updatedHabit: Omit<Habit, 'id' | 'days' | 'createdAt'> = {
      name: trimmedName,
      duration,
      startDate,
      directoryId: habit.directoryId,
    };

    setIsSubmitting(true);
    onUpdate(updatedHabit);
  };

  return (
    <div>
      <div className="mt-4">
        <Label
          htmlFor="habit-name"
          className="block text-sm mt-4 mb-2 font-medium text-muted-foreground"
        >
          Habit Name
        </Label>
        <Input
          id="habit-name"
          placeholder="Enter habit name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-describedby="habit-name-error"
          className={clsx(
            'border',
            error && name.trim() === ''
              ? 'border-red-500'
              : 'border-gray-300',
            'focus:ring-0'
          )}
        />
        {error && name.trim() === '' && (
          <p
            id="habit-name-error"
            className="text-red-500 text-sm mt-1"
            role="alert"
          >
            Habit name cannot be empty.
          </p>
        )}

        <Label
          htmlFor="habit-duration"
          className="block text-sm mt-4 mb-2 font-medium text-muted-foreground"
        >
          Duration (Days)
        </Label>
        <Input
          id="habit-duration"
          type="number"
          min={1}
          max={365}
          step={1}
          value={duration}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) {
              setDuration(value);
              if (value > 365) {
                setError('Duration cannot exceed 365 days.');
              } else {
                setError(null);
              }
            } else {
              setDuration(1);
              setError(null);
            }
          }}
          aria-describedby="habit-duration-error"
          className={clsx(
            'border',
            error ? 'border-red-500' : 'border-gray-300',
            'focus:ring-0'
          )}
        />
        {error && (
          <p
            id="habit-duration-error"
            className="text-red-500 text-sm mt-1"
            role="alert"
          >
            {error}
          </p>
        )}

        <Label
          htmlFor="habit-start-date"
          className="block text-sm mt-4 mb-2 font-medium text-muted-foreground"
        >
          Start Date
        </Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-left flex justify-between items-center"
              aria-label={
                startDate
                  ? `Selected start date is ${startDate.toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }
                    )}`
                  : 'Select a start date'
              }
            >
              {startDate
                ? startDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : 'Select a start date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <Calendar
              selected={startDate || undefined}
              onSelect={(date: Date | undefined) => {
                setStartDate(date || null);
                setCalendarOpen(false);
              }}
              mode="single"
            />
          </PopoverContent>
        </Popover>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            className="w-full"
            onClick={handleUpdate}
            disabled={
              isSubmitting || duration > 365 || name.trim() === ''
            }
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Updating...
              </div>
            ) : (
              'Update Habit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

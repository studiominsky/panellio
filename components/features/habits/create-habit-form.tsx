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
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import clsx from 'clsx';
import { Habit } from '@/types/habit-types';

interface CreateHabitFormProps {
  onClose: () => void;
  onCreate: (
    newHabit: Omit<Habit, 'id' | 'days' | 'createdAt'>
  ) => void;
  directoryId: string;
}

export default function CreateHabitForm({
  onClose,
  onCreate,
}: CreateHabitFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateHabit = () => {
    const trimmedName = name.trim();

    // Validate inputs
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

    if (!user) {
      toast({
        title: 'Unauthorized',
        description: 'You must be logged in to create a habit.',
        variant: 'destructive',
      });
      return;
    }

    const newHabit: Omit<Habit, 'id' | 'days' | 'createdAt'> = {
      name: trimmedName,
      duration,
      startDate,
      directoryId: user.uid,
    };

    onCreate(newHabit);

    setName('');
    setDuration(30);
    setStartDate(new Date());
    setError(null);
    onClose();
  };

  return (
    <div>
      <div className="mt-4">
        {/* Habit Name Input */}
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

        {/* Duration Input */}
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

        {/* Start Date Picker */}
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

        {/* Create Habit Button */}
        <Button
          onClick={handleCreateHabit}
          className="mt-6 w-full"
          disabled={duration > 365}
        >
          Create Habit
        </Button>
      </div>
    </div>
  );
}

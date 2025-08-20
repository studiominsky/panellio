'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

import { toast } from '@/hooks/use-toast';
import clsx from 'clsx';
import { Calendar, Edit, Ellipsis, Trash2 } from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarShortcut,
} from '@/components/ui/menubar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import EditHabitForm from './edit-habit-form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Habit, HabitDay } from '@/types/habit-types';
import {
  deleteHabit,
  updateHabit,
  updateHabitDay,
} from '@/services/habit-service';

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

interface HabitItemProps {
  habit: Habit;
  directoryId: string;
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  width: number;
  height: number;
}

export default function HabitItem({
  habit,
  directoryId,
  setHabits,
  width,
  height,
}: HabitItemProps) {
  const { user } = useAuth();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState(false);
  const [filterMode, setFilterMode] = useState<
    'completed' | 'remaining'
  >(habit.filterMode || 'completed');
  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    setFilterMode(habit.filterMode || 'completed');
  }, [habit.filterMode]);

  const handleToggleCompletion = async (
    dayIndex: number,
    completed: boolean
  ) => {
    if (!user) {
      toast({
        title: 'Unauthorized',
        description: 'You must be logged in to update a habit.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateHabitDay(
        user.uid,
        directoryId,
        habit.id,
        dayIndex,
        completed
      );
      setHabits((prevHabits) =>
        prevHabits.map((c) =>
          c.id === habit.id
            ? {
                ...c,
                days: c.days.map((day, index) =>
                  index === dayIndex ? { ...day, completed } : day
                ),
              }
            : c
        )
      );
      toast({
        title: 'Success',
        description: 'Habit updated successfully.',
      });
    } catch (error) {
      console.error('Error updating habit day:', error);
      toast({
        title: 'Error',
        description: 'Failed to update habit.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteHabit = async () => {
    if (!user) return;

    try {
      await deleteHabit(user.uid, directoryId, habit.id);
      setHabits((prevHabits) =>
        prevHabits.filter((c) => c.id !== habit.id)
      );
      toast({
        title: 'Success',
        description: 'Habit deleted successfully.',
      });
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete habit.',
        variant: 'destructive',
      });
    }
  };

  const completedDays = habit.days.filter(
    (day) => day.completed
  ).length;
  const remainingDays = habit.duration - completedDays;
  const completionPercentage = habit.duration
    ? ((completedDays / habit.duration) * 100).toFixed(1)
    : '0.0';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getUpdatedDays = (
    newDuration: number,
    newStartDate: Date,
    currentDays: HabitDay[]
  ): HabitDay[] => {
    const newDays: HabitDay[] = [];
    for (let i = 0; i < newDuration; i++) {
      const date = new Date(newStartDate);
      date.setDate(date.getDate() + i);

      if (i < currentDays.length) {
        newDays.push({
          date,
          completed: currentDays[i].completed,
        });
      } else {
        newDays.push({
          date,
          completed: false,
        });
      }
    }
    return newDays;
  };

  const getTooltipMessage = (
    isUpcoming: boolean,
    isCompleted: boolean,
    isToday: boolean,
    dayDate: Date
  ): string => {
    if (isUpcoming) {
      return `Upcoming day: ${formatDate(dayDate)}`;
    }

    if (isToday) {
      return isCompleted
        ? `Today is done: ${formatDate(dayDate)}`
        : `Today is incomplete: ${formatDate(dayDate)}`;
    }

    return isCompleted
      ? `Completed on: ${formatDate(dayDate)}`
      : `Incomplete day: ${formatDate(dayDate)}`;
  };

  const handleFilterModeChange = async (
    mode: 'completed' | 'remaining'
  ) => {
    if (!user) {
      toast({
        title: 'Unauthorized',
        description: 'You must be logged in to update a habit.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateHabit(user.uid, directoryId, habit.id, {
        filterMode: mode,
      });

      setFilterMode(mode);
      setAnimateKey((prev) => prev + 1);
      setHabits((prevHabits) =>
        prevHabits.map((c) =>
          c.id === habit.id ? { ...c, filterMode: mode } : c
        )
      );
    } catch (error) {
      console.error('Error updating filter mode:', error);
    }
  };

  const prevFilterModeRef = useRef(filterMode);

  useEffect(() => {
    prevFilterModeRef.current = filterMode;
  }, [filterMode]);

  const shouldAnimate = prevFilterModeRef.current !== filterMode;
  const animationClass = shouldAnimate ? 'animate-slide-down' : '';

  return (
    <li className="py-4 border-t border-border first:border-t-0 relative">
      <div className="flex mb-5 justify-between w-full">
        <span
          className={`flex items-start justify-between w-full text-foreground/60`}
        >
          <h3 className="text-foreground text-start font-bold text-2xl max-w-[80%]">
            {habit.name}
          </h3>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger
                variant="ghost"
                className="p-1 h-8 hover:bg-muted focus:outline-none"
              >
                <Ellipsis size={20} />
              </MenubarTrigger>
              <MenubarContent align="end">
                <MenubarItem
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  Edit
                  <MenubarShortcut>
                    <Edit size={14} />
                  </MenubarShortcut>
                </MenubarItem>

                <MenubarSeparator />

                {/* Filter Mode Submenu */}
                <MenubarSub>
                  <MenubarSubTrigger>Show</MenubarSubTrigger>
                  <MenubarSubContent className="border border-border">
                    <MenubarRadioGroup
                      value={filterMode}
                      onValueChange={(value) =>
                        handleFilterModeChange(
                          value as 'completed' | 'remaining'
                        )
                      }
                    >
                      <MenubarRadioItem value="completed">
                        Show Completed
                      </MenubarRadioItem>
                      <MenubarRadioItem value="remaining">
                        Show Remaining
                      </MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarSubContent>
                </MenubarSub>

                <MenubarSeparator />
                <MenubarItem
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  Delete
                  <MenubarShortcut>
                    <Trash2 className="text-[--red-500]" size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </span>
      </div>
      <div
        className={`flex justify-between items-base ${
          width < 6 ? 'flex-col' : 'flex-row'
        } ${height > 4 && 'pt-9'}
        ${height <= 5 && width < 3 && 'pt-0'}
        `}
      >
        <div
          className={`flex gap-5 sm:mb-0 ${
            width < 6 ? 'flex-row' : 'flex-col'
          }`}
        >
          <div className={`flex flex-col items-start `}>
            <span className="text-foreground/60 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Duration</span>
            </span>
            <span
              className={`flex gap-2 text-foreground font-semibold  text-start, ${
                width < 6 ? 'text-2xl' : 'text-3xl'
              }`}
            >
              {habit.duration} <span>days</span>
            </span>
            <span className="text-[--ui-primary] text-sm font-semibold">
              {completionPercentage}%
            </span>
          </div>
          <div
            key={animateKey}
            className={`flex flex-col items-start ${animationClass}`}
          >
            <span className="text-foreground/60 text-sm flex gap-2">
              <span>
                {filterMode === 'completed'
                  ? 'Completed'
                  : 'Remaining'}
              </span>
            </span>
            <span
              className={`flex gap-2 text-foreground font-semibold  text-start, ${
                width < 6 ? 'text-2xl' : 'text-3xl'
              }`}
            >
              {filterMode === 'completed'
                ? completedDays
                : remainingDays}{' '}
              <span>days</span>
            </span>
            <span className="text-[--ui-primary] text-sm font-semibold">
              {filterMode === 'completed'
                ? `${completionPercentage}%`
                : `${((remainingDays / habit.duration) * 100).toFixed(
                    1
                  )}%`}
            </span>
          </div>
        </div>

        {/* Circles Section */}
        <div className="flex flex-col">
          <div
            className={`flex flex-wrap ${
              width < 6
                ? 'h-full w-full max-w-full gap-4 justify-between pt-5'
                : 'max-h-[175px] overflow-auto ml-auto justify-end max-w-[90%] p-1 gap-5'
            }`}
          >
            {habit.days.map((day, index) => {
              const dayDate = new Date(day.date);
              dayDate.setHours(0, 0, 0, 0);

              const isToday = dayDate.getTime() === today.getTime();
              const isCompleted = day.completed;
              const isUpcoming = dayDate.getTime() > today.getTime();

              let backgroundColor = 'bg-foreground/10';
              if (isToday) {
                backgroundColor = 'bg-[--ui-primary]';
              } else if (isCompleted && !isUpcoming) {
                backgroundColor = 'bg-[--ui-primary-opacity]';
              }

              const textColor = isCompleted
                ? 'text-white'
                : 'text-foreground';

              return (
                <div
                  key={`${habit.id}-${index}`}
                  className="flex flex-col items-center"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          id={`habit-day-${habit.id}-${index}`}
                          disabled={isUpcoming}
                          onClick={() => {
                            if (!isUpcoming) {
                              handleToggleCompletion(
                                index,
                                !isCompleted
                              );
                            }
                          }}
                          className={clsx(
                            `relative group w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center  transition-all duration-300`,
                            backgroundColor,
                            textColor,
                            {
                              'cursor-pointer hover:scale-[1.1] transition duration-300':
                                !isUpcoming,
                              'hover:bg-inverted':
                                !isUpcoming && !isToday,
                              'cursor-not-allowed': isUpcoming,
                            }
                          )}
                          aria-pressed={isCompleted}
                          aria-label={
                            isUpcoming
                              ? formatDate(dayDate)
                              : `Mark ${formatDate(dayDate)} as ${
                                  isCompleted
                                    ? 'incomplete'
                                    : 'complete'
                                }`
                          }
                        >
                          {!isUpcoming && (
                            <>
                              {isToday && isCompleted && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={clsx(
                                    'stroke-[--background] absolute h-4 w-4 transition-opacity duration-300',
                                    isCompleted && isToday
                                      ? 'opacity-100'
                                      : 'opacity-0 group-hover:opacity-100'
                                  )}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <span>
                          {getTooltipMessage(
                            isUpcoming,
                            isCompleted,
                            isToday,
                            dayDate
                          )}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Habit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={() => setIsEditDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Modify the details of the habit.
            </DialogDescription>
          </DialogHeader>
          <EditHabitForm
            habit={habit}
            onUpdate={async (
              updatedHabit: Partial<
                Omit<Habit, 'id' | 'days' | 'createdAt'>
              >
            ) => {
              if (!user) return;
              try {
                const startDateChanged =
                  updatedHabit.startDate &&
                  updatedHabit.startDate.getTime() !==
                    habit.startDate.getTime();

                const newDuration =
                  updatedHabit.duration || habit.duration;
                const newStartDate =
                  updatedHabit.startDate || habit.startDate;
                const newDays = getUpdatedDays(
                  newDuration,
                  newStartDate,
                  habit.days
                );

                const updatedFields: Partial<
                  Omit<Habit, 'id' | 'createdAt'>
                > = {
                  ...updatedHabit,
                  days: newDays,
                };

                // Include filterMode if it's part of the updatedHabit
                if (updatedHabit.filterMode) {
                  updatedFields.filterMode = updatedHabit.filterMode;
                }

                await updateHabit(
                  user.uid,
                  directoryId,
                  habit.id,
                  updatedFields
                );

                setHabits((prevHabits) =>
                  prevHabits.map((c) =>
                    c.id === habit.id
                      ? { ...c, ...updatedHabit, days: newDays }
                      : c
                  )
                );

                toast({
                  title: 'Success',
                  description: 'Habit updated successfully.',
                });
                setIsEditDialogOpen(false);
              } catch (error) {
                console.error('Error updating habit:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to update habit.',
                  variant: 'destructive',
                });
              }
            }}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {habit.name} habit?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteHabit}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}

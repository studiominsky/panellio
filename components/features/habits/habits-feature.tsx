'use client';

import React, { useEffect, useState } from 'react';
import HabitList from './habit-list';
import CreateHabitForm from './create-habit-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarShortcut,
  MenubarSeparator,
} from '@/components/ui/menubar';
import { Ellipsis, Trash2 } from 'lucide-react';
import { DirectoryItem } from '@/types/directory-type';
import {
  addHabit,
  deleteHabits,
  getHabits,
} from '@/services/habit-service';
import { Habit } from '@/types/habit-types';

interface HabitsFeatureProps {
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
  width: number;
  height: number;
}

export default function HabitsFeature({
  directoryId,
  onDirectoryItemRemoved,
  itemData,
  width,
  height,
}: HabitsFeatureProps) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHabits = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const fetchedHabits = await getHabits(user.uid, directoryId);
        setHabits(fetchedHabits);
      } catch (error) {
        console.error('Error fetching habits:', error);
        toast({
          title: 'Error',
          description: 'Failed to load habits.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [user, directoryId]);

  const handleCreateHabit = async (
    newHabit: Omit<Habit, 'id' | 'days' | 'createdAt'>
  ) => {
    if (!user) return;

    try {
      const habitId = await addHabit(user.uid, directoryId, newHabit);
      const createdHabit: Habit = {
        id: habitId,
        name: newHabit.name,
        duration: newHabit.duration,
        startDate: newHabit.startDate,
        days: Array.from({ length: newHabit.duration }, (_, i) => ({
          date: new Date(
            newHabit.startDate.getTime() + i * 24 * 60 * 60 * 1000
          ),
          completed: false,
        })),
        createdAt: new Date(),
        directoryId,
      };
      setHabits((prev) => [...prev, createdHabit]);
      toast({
        title: 'Success',
        description: 'Habit created successfully.',
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to create habit.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAllHabits = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allHabitIds = habits.map((habit) => habit.id);
      await deleteHabits(user.uid, directoryId, allHabitIds);
      setHabits([]);

      toast({
        title: 'Success',
        description: 'All habits deleted successfully.',
      });

      setIsDeleteDialogOpen(false);
      onDirectoryItemRemoved(itemData.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete habits.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      <Menubar className="directory-item-drag-handle cursor-grab h-8 z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ghost"
            className="bg-muted h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsCreateDialogOpen(true)}>
              Add Habit
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              variant="destructive"
              onClick={() => {
                setIsDeleteDialogOpen(true);
              }}
            >
              Remove Habits
              <MenubarShortcut>
                <Trash2 className="text-[--red-500]" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <HabitList
        habits={habits}
        directoryId={directoryId}
        setHabits={setHabits}
        loading={loading}
        width={width}
        height={height}
      />

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={() => setIsCreateDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
            <DialogDescription>
              Enter the details for the new habit.
            </DialogDescription>
          </DialogHeader>
          <CreateHabitForm
            onCreate={handleCreateHabit}
            onClose={() => setIsCreateDialogOpen(false)}
            directoryId={directoryId}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogTitle>Remove All Habits</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to remove all habits? This action
            cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllHabits}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

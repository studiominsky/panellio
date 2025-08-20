'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Daily, DailyBlock } from '@/types/daily-types';
import {
  getDaily,
  addDaily,
  updateDaily,
  deleteDaily,
} from '@/services/daily-service';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import { Ellipsis, Loader, Maximize2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';
import CreateEditDailyForm from './create-edit-daily-form';
import CreateEditBlockForm from './create-edit-block-form';
import DayTimetable from './day-timetable';
import { DirectoryItem } from '@/types/directory-type';

interface DailyFeatureProps {
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
}

export default function DailyFeature({
  directoryId,
  itemData,
  onDirectoryItemRemoved,
}: DailyFeatureProps) {
  const { user, loading } = useAuth();
  const [daily, setDaily] = useState<Daily | null>(null);
  const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);
  const [isDeleteDailyDialogOpen, setIsDeleteDailyDialogOpen] =
    useState(false);
  const [isDeleteDailyLoading, setIsDeleteDailyLoading] =
    useState(false);
  const [isAddBlockDialogOpen, setIsAddBlockDialogOpen] =
    useState(false);
  const [newBlock, setNewBlock] = useState<DailyBlock | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const loadDaily = useCallback(async () => {
    if (!user) return;
    try {
      const d = await getDaily(user.uid, directoryId);
      setDaily(d);
    } catch (error) {
      console.error('Error loading daily:', error);
      toast({
        title: 'Error',
        description: 'Failed to load daily schedule.',
        variant: 'destructive',
      });
    }
  }, [user, directoryId]);

  useEffect(() => {
    if (!user) return;
    loadDaily();
  }, [user, loadDaily]);

  const handleSaveDaily = async (
    updates: Omit<Daily, 'id' | 'createdAt'>
  ) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (daily) {
        await updateDaily(user.uid, directoryId, daily.id, updates);
        setDaily({ ...daily, ...updates });
        toast({
          title: 'Success',
          description: 'Daily schedule updated successfully.',
        });
      } else {
        const id = await addDaily(user.uid, directoryId, updates);
        toast({
          title: 'Success',
          description: 'Daily schedule created successfully.',
        });
        loadDaily();
      }
      setIsDailyDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving daily:', error);
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to save daily schedule.',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteDaily = async () => {
    if (!user) return;
    setIsDeleteDailyLoading(true);
    try {
      if (daily) {
        await deleteDaily(user.uid, directoryId);
        setDaily(null);
        toast({
          title: 'Success',
          description: 'Daily schedule deleted successfully.',
        });
      }
      onDirectoryItemRemoved(itemData.id);
      setIsDeleteDailyDialogOpen(false);
    } catch (error) {
      console.error('Error deleting daily:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete daily schedule.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDailyLoading(false);
    }
  };

  const handleBlockUpdate = async (updatedBlock: DailyBlock) => {
    if (!user || !daily) return;
    try {
      const updatedBlocks = daily.blocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      );
      await updateDaily(user.uid, directoryId, daily.id, {
        blocks: updatedBlocks,
      });
      setDaily({ ...daily, blocks: updatedBlocks });
      toast({
        title: 'Success',
        description: `Block "${updatedBlock.name}" updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating block:', error);
      toast({
        title: 'Error',
        description: `Failed to update block "${updatedBlock.name}".`,
        variant: 'destructive',
      });
    }
  };

  const handleBlockDelete = async (blockId: string) => {
    if (!user || !daily) return;
    try {
      const blockToDelete = daily.blocks.find(
        (b) => b.id === blockId
      );
      if (!blockToDelete) return;
      const updatedBlocks = daily.blocks.filter(
        (b) => b.id !== blockId
      );
      await updateDaily(user.uid, directoryId, daily.id, {
        blocks: updatedBlocks,
      });
      setDaily({ ...daily, blocks: updatedBlocks });
      toast({
        title: 'Success',
        description: `Block "${blockToDelete.name}" deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting block:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the block.',
        variant: 'destructive',
      });
    }
  };

  const handleAddBlock = () => {
    if (!user || !daily) {
      toast({
        title: 'Error',
        description:
          'User not authenticated or daily schedule not set.',
        variant: 'destructive',
      });
      return;
    }
    const defaultBlock: DailyBlock = {
      id: uuidv4(),
      name: '',
      startTime: '09:00',
      endTime: '16:30',
      color: 'blue',
      completed: false,
      repeat: false,
      directoryId,
    };
    setNewBlock(defaultBlock);
    setIsAddBlockDialogOpen(true);
  };

  return (
    <div
      style={{ position: 'relative', height: `calc(100% - 2rem)` }}
    >
      <Menubar className="directory-item-drag-handle cursor-grab py-4 relative z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ghost"
            className="bg-muted h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsDailyDialogOpen(true)}>
              {daily ? 'Edit Daily' : 'Add Daily'}
            </MenubarItem>
            <MenubarSeparator />
            {daily && (
              <>
                <MenubarItem onClick={handleAddBlock}>
                  Add Block
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setIsFullscreen(true)}>
                  Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
              </>
            )}
            <MenubarItem
              variant="destructive"
              onClick={() => setIsDeleteDailyDialogOpen(true)}
            >
              Remove Daily
              <MenubarShortcut>
                <Trash2 className="text-red-500" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="p-4 bg-card overflow-auto border-l border-r border-b border-border h-full">
        {daily ? (
          <DayTimetable
            blocks={daily.blocks}
            startTime={daily.dayStart}
            endTime={daily.dayEnd}
            onBlockUpdate={handleBlockUpdate}
            onBlockDelete={handleBlockDelete}
          />
        ) : (
          <div className="py-1 pt-4 flex flex-wrap gap-8">
            <p className="text-sm text-muted-foreground">
              No daily schedule set up yet.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={isDailyDialogOpen}
        onOpenChange={setIsDailyDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {daily ? 'Edit Daily' : 'Add Daily'}
            </DialogTitle>
            <DialogDescription>
              {daily
                ? 'Modify your existing daily schedule.'
                : 'Set up your daily schedule.'}
            </DialogDescription>
          </DialogHeader>
          <CreateEditDailyForm
            daily={daily}
            onSave={handleSaveDaily}
            onCancel={() => setIsDailyDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDailyDialogOpen}
        onOpenChange={setIsDeleteDailyDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Daily Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your daily schedule?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDailyDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDaily}
              disabled={isDeleteDailyLoading}
            >
              {isDeleteDailyLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="animate-spin" size={16} />
                  Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddBlockDialogOpen}
        onOpenChange={setIsAddBlockDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Block</DialogTitle>
            <DialogDescription>
              Enter the details for the new time block.
            </DialogDescription>
          </DialogHeader>
          {newBlock && (
            <CreateEditBlockForm
              initialBlock={newBlock}
              onSave={(block: DailyBlock) => {
                if (!user || !daily) {
                  toast({
                    title: 'Error',
                    description:
                      'User not authenticated or daily schedule not set.',
                    variant: 'destructive',
                  });
                  return;
                }
                const updatedBlocks = [...daily.blocks, block];
                setDaily({ ...daily, blocks: updatedBlocks });
                updateDaily(user.uid, directoryId, daily.id, {
                  blocks: updatedBlocks,
                })
                  .then(() => {
                    toast({
                      title: 'Success',
                      description: 'New block added successfully.',
                    });
                    setIsAddBlockDialogOpen(false);
                    setNewBlock(null);
                  })
                  .catch((error) => {
                    console.error('Error adding block:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to add new block.',
                      variant: 'destructive',
                    });
                  });
              }}
              onCancel={() => {
                setIsAddBlockDialogOpen(false);
                setNewBlock(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="min-w-[90%] min-h-[80%] p-0 rounded-t-2xl rounded-b-none"
          style={{ height: '90vh' }}
        >
          <Menubar className="cursor-grab h-8 z-10 px-6 bg-muted flex justify-between border border-border rounded-t-xl">
            <MenubarMenu>
              <MenubarTrigger
                variant="ghost"
                className="bg-muted h-4 p-1 absolute right-6"
              >
                <Ellipsis size={23} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => setIsDailyDialogOpen(true)}
                >
                  Edit Daily
                </MenubarItem>
                <MenubarSeparator />
                {daily && (
                  <MenubarItem onClick={handleAddBlock}>
                    Add Block
                  </MenubarItem>
                )}
                {daily && <MenubarSeparator />}
                <MenubarItem onClick={() => setIsFullscreen(false)}>
                  Exit Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  variant="destructive"
                  onClick={() => setIsDeleteDailyDialogOpen(true)}
                >
                  Remove Daily
                  <MenubarShortcut>
                    <Trash2 className="text-red-500" size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <div className="p-4 overflow-auto h-[calc(100%-2rem)]">
            {daily ? (
              <>
                <DayTimetable
                  blocks={daily.blocks}
                  startTime={daily.dayStart}
                  endTime={daily.dayEnd}
                  onBlockUpdate={handleBlockUpdate}
                  onBlockDelete={handleBlockDelete}
                />
              </>
            ) : (
              <div className="py-1 pt-4 flex flex-wrap gap-8">
                <p className="text-sm text-muted-foreground">
                  No daily schedule set up yet. Create one to get
                  started.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

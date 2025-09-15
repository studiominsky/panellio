'use client';

import React, { useState } from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarShortcut,
} from './ui/menubar';
import {
  Plus,
  Folders,
  Ellipsis,
  Edit2,
  Trash2,
  Loader,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useDirectory } from '@/context/dir-context';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Directory } from '@/types/directory-type';
import CreateDirectoryForm from './create-directory';
import CreateStickyNoteForm from './sticky-notes/create-sticky-note-form';

interface DirectorySettingsProps {
  directory: Directory;
  onAddItem: (itemType: string, payload?: any) => void;
  onDirectoryUpdated?: (updatedDirectory: Directory) => void;
}

export default function DirectorySettings({
  directory,
  onAddItem,
  onDirectoryUpdated,
}: DirectorySettingsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { removeDirectory, editDirectory } = useDirectory();
  const [isSaving, setIsSaving] = useState(false);

  const [
    isCreateStickyNoteDialogOpen,
    setIsCreateStickyNoteDialogOpen,
  ] = useState(false);

  const handleDialogOpen = (type: string) => {
    if (type === 'edit') {
      setNewName(directory.name);
      setNewDescription(directory.description || '');
    }

    setOpenDialog(type);
  };

  const handleDialogClose = () => {
    setOpenDialog(null);
  };

  const handleAddItemClick = (itemType: string, payload?: any) => {
    if (itemType === 'stickyNote') {
      setIsCreateStickyNoteDialogOpen(true);
    } else {
      onAddItem(itemType, payload);
    }
  };

  const confirmDeleteDirectory = () => {
    setIsDeleteDialogOpen(true);
  };

  const deleteDirectory = async () => {
    if (!user) return;

    try {
      await removeDirectory(directory.id);
      toast({ title: 'Directory removed successfully!' });
      setIsDeleteDialogOpen(false);

      router.push(`/${user.username}`);
    } catch (error) {
      console.error('Error removing directory:', error);
      toast({
        title: 'Failed to remove directory',
        variant: 'destructive',
      });
    }
  };

  const handleEditDirectory = async () => {
    if (!newName.trim() || !user) return;

    setIsSaving(true);

    try {
      await editDirectory(
        directory.id,
        newName.trim(),
        newDescription
      );

      if (onDirectoryUpdated) {
        onDirectoryUpdated({
          ...directory,
          name: newName.trim(),
          description: newDescription,
        });
      }

      toast({ title: 'Directory updated successfully!' });

      setOpenDialog(null);
    } catch (error) {
      console.error('Error updating directory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the directory.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nameChanged = newName.trim() !== directory.name;
  const descriptionChanged =
    (newDescription || '') !== (directory.description || '');
  const hasChanges = nameChanged || descriptionChanged;

  const hasFeature = (directoryItemName: string) => {
    return directory?.items?.some(
      (item) =>
        item.name?.toLowerCase() === directoryItemName.toLowerCase()
    );
  };

  return (
    <div>
      <div className="flex gap-3">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger variant="primary">
              Add New <Plus className="ml-2" size={18} />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem
                onClick={() => handleDialogOpen('directory')}
              >
                Directory
                <MenubarShortcut>
                  <Folders size={14} />
                </MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />

              <MenubarItem
                disabled={hasFeature('assets')}
                onClick={() => handleAddItemClick('assets')}
              >
                Assets
                <MenubarShortcut>
                  <Folders size={14} />
                </MenubarShortcut>
              </MenubarItem>

              <MenubarSeparator />

              <MenubarSub>
                <MenubarSubTrigger>Features</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem
                    onClick={() => handleAddItemClick('tasks')}
                    disabled={hasFeature('tasks')}
                  >
                    Tasks
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => handleAddItemClick('events')}
                    disabled={hasFeature('events')}
                  >
                    Events
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => handleAddItemClick('tables')}
                    disabled={hasFeature('tables')}
                  >
                    Tables
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => handleAddItemClick('notes')}
                    disabled={hasFeature('notes')}
                  >
                    Notes
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => handleAddItemClick('daily')}
                    disabled={hasFeature('daily')}
                  >
                    Daily
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => handleAddItemClick('dictionary')}
                    disabled={hasFeature('dictionary')}
                  >
                    Dictionary
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => handleAddItemClick('places')}
                    disabled={hasFeature('places')}
                  >
                    Places
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => handleAddItemClick('nodes')}
                    disabled={hasFeature('nodes')}
                  >
                    Nodes
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => handleAddItemClick('habits')}
                    disabled={hasFeature('habits')}
                  >
                    Habits
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSeparator />
              <MenubarItem
                onClick={() => handleAddItemClick('stickyNote')}
              >
                Sticky Note
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <Menubar>
          <MenubarMenu>
            <MenubarTrigger variant="outline" size="sm">
              <Ellipsis size={18} />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => handleDialogOpen('edit')}>
                Edit {directory.name}
                <MenubarShortcut>
                  <Edit2 size={14} />
                </MenubarShortcut>
              </MenubarItem>

              <MenubarSeparator />

              <MenubarItem
                variant="destructive"
                onClick={confirmDeleteDirectory}
              >
                Delete {directory.name}
                <MenubarShortcut>
                  <Trash2 size={14} className="text-[--red-500]" />
                </MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <Dialog
        open={openDialog === 'edit'}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Directory</DialogTitle>
            <DialogDescription>
              Update the directory name and description.
            </DialogDescription>
          </DialogHeader>

          <Input
            type="text"
            placeholder="New Directory Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-4"
          />
          <Textarea
            placeholder="New Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="mt-4"
          />

          <Button
            onClick={handleEditDirectory}
            disabled={isSaving || !newName.trim() || !hasChanges}
            className="mt-4 w-full"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={16} />
                Saving...
              </div>
            ) : (
              'Save changes'
            )}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialog === 'directory'}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <CreateDirectoryForm onClose={handleDialogClose} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this directory? This
              action cannot be undone and you will lose all the data
              related to this directory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="primary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteDirectory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateStickyNoteDialogOpen}
        onOpenChange={setIsCreateStickyNoteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Sticky Note</DialogTitle>
            <DialogDescription>
              Write the sticky note text, optionally add tags, and
              choose a background color.
            </DialogDescription>
          </DialogHeader>

          <CreateStickyNoteForm
            onClose={() => setIsCreateStickyNoteDialogOpen(false)}
            onCreate={(payload) => {
              onAddItem('stickyNote', payload);
              setIsCreateStickyNoteDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

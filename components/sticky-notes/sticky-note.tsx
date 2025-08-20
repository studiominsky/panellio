'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { Trash2, Ellipsis } from 'lucide-react';
import { DirectoryItem } from '@/types/directory-type';
import { merge } from '@/utils/merge-classes';
import { TagsInput } from '@/components/ui/tags-input';
import { useTheme } from 'next-themes';

interface StickyNoteItemProps {
  directoryId: string;
  width: number;
  height: number;
  onDirectoryItemRemoved: (itemId: string) => void;
  itemData: DirectoryItem;
}

const themeClassMapping: Record<string, string> = {
  blue: 'color-theme-blue',
  green: 'color-theme-green',
  orange: 'color-theme-orange',
  neutral: '',
};

const bgColorMapping: Record<string, string> = {
  blue: 'var(--blue-1000)',
  green: 'var(--green-1000)',
  orange: 'var(--orange-900)',
  neutral: '',
};

const lightBgMapping: Record<string, string> = {
  blue: 'var(--blue-600)',
  green: 'var(--green-600)',
  orange: 'var(--orange-600)',
  neutral: '',
};

export default function StickyNote({
  directoryId,
  onDirectoryItemRemoved,
  itemData,
}: StickyNoteItemProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [noteText, setNoteText] = useState(itemData.text || '');
  const [noteColor, setNoteColor] = useState(
    itemData.color || 'blue'
  );
  const [noteTags, setNoteTags] = useState<string[]>(
    itemData.tags || []
  );

  const [tempText, setTempText] = useState(noteText);
  const [tempColor, setTempColor] = useState(noteColor);
  const [tempTags, setTempTags] = useState<string[]>(noteTags);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isLight, setIsLight] = useState(
    !document.documentElement.classList.contains('dark')
  );

  // Ref for auto-resizing textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(
        !document.documentElement.classList.contains('dark')
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  // Auto-resize the textarea whenever its content changes
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // When dialog opens, make sure the textarea is properly resized
  useEffect(() => {
    if (isEditDialogOpen) {
      // We run it in a timeout to ensure the textarea is rendered
      setTimeout(() => {
        autoResize();
      }, 0);
    }
  }, [isEditDialogOpen]);

  async function handleSaveChanges() {
    if (!user) return;
    setIsUpdating(true);

    try {
      const directoryRef = doc(
        db,
        'users',
        user.uid,
        'directories',
        directoryId
      );
      const docSnap = await getDoc(directoryRef);

      if (!docSnap.exists()) {
        toast({
          title: 'Error',
          description: 'Directory not found',
          variant: 'destructive',
        });
        return;
      }

      const existingItems = docSnap.data().items || [];
      const updatedItems = existingItems.map((item: DirectoryItem) =>
        item.id === itemData.id
          ? {
              ...item,
              text: tempText,
              color: tempColor,
              tags: tempTags,
            }
          : item
      );

      await updateDoc(directoryRef, { items: updatedItems });

      setNoteText(tempText);
      setNoteColor(tempColor);
      setNoteTags(tempTags);
      toast({ title: 'Note updated' });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  function handleDelete() {
    setIsDeleteDialogOpen(true);
  }

  const handleTextAreaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTempText(e.target.value);
    autoResize();
  };

  const COLORS = ['blue', 'green', 'orange', 'neutral'];

  const noteTextColor =
    noteColor === 'neutral'
      ? isLight
        ? 'text-black'
        : 'text-white'
      : 'text-white';

  return (
    <div
      style={{ position: 'relative', height: `calc(100% - 2rem)` }}
    >
      <Menubar className="items-center transition duration-300 directory-item-drag-handle cursor-grab py-4 relative z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ellipsis"
            className="h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsEditDialogOpen(true)}>
              Edit Note
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive" onClick={handleDelete}>
              Remove Note
              <MenubarShortcut>
                <Trash2 className="text-red-500" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Double-clicking this container opens the edit dialog */}
      <div
        className={merge(
          'flex flex-col justify-between relative h-full p-4 overflow-auto cursor-pointer',
          noteColor === 'neutral'
            ? 'bg-card border-border border-b border-l border-r text-foreground'
            : themeClassMapping[noteColor]
        )}
        style={{
          backgroundColor:
            noteColor === 'neutral'
              ? 'hsl(var(--card))'
              : isLight
              ? lightBgMapping[noteColor]
              : bgColorMapping[noteColor],
        }}
        onDoubleClick={() => setIsEditDialogOpen(true)}
      >
        <p
          className={merge(
            'text-start whitespace-pre-wrap text-md',
            noteTextColor
          )}
        >
          {noteText}
        </p>

        {noteTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {noteTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center rounded-full border px-2.5 text-xs font-semibold mb-1 max-w-fit py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Change the text, color, or tags of your note.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Label className="mb-2 block text-sm font-medium text-muted-foreground">
              Note Text
            </Label>
            <Textarea
              ref={textareaRef}
              value={tempText}
              onChange={handleTextAreaChange}
              style={{ overflow: 'hidden' }}
            />
          </div>

          <div className="mt-4">
            <Label className="mb-2 block text-sm font-medium text-muted-foreground">
              Tags
            </Label>
            <TagsInput
              value={tempTags}
              onChange={setTempTags}
              placeholder="Add tags and press Enter..."
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <Label className="block text-sm font-medium text-muted-foreground">
              Note Color
            </Label>
            <div className="flex gap-1 items-center">
              {COLORS.map((c) => {
                const checkColorClass =
                  c === 'neutral'
                    ? 'text-inverted'
                    : theme === 'dark'
                    ? 'text-white'
                    : 'text-background';

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTempColor(c)}
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                  >
                    <div
                      className={merge(
                        'w-5 h-5 rounded-full flex items-center justify-center',
                        c === 'neutral'
                          ? 'border border-border bg-card'
                          : themeClassMapping[c]
                      )}
                      style={{
                        backgroundColor:
                          c === 'blue'
                            ? 'var(--blue-600)'
                            : c === 'green'
                            ? 'var(--green-600)'
                            : c === 'orange'
                            ? 'var(--orange-600)'
                            : 'var(--card)',
                      }}
                    >
                      {tempColor === c && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[--theme-primary]">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={merge(
                              'h-4 w-4',
                              checkColorClass
                            )}
                          >
                            <path
                              d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                              fill="currentColor"
                            ></path>
                          </svg>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="default"
              onClick={handleSaveChanges}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDirectoryItemRemoved(itemData.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

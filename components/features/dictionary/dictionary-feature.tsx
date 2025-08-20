'use client';

import React, { useEffect, useState } from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import {
  Ellipsis,
  Trash2,
  Play,
  Edit,
  Maximize2,
  MoveLeft,
  MoveRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TagsInput } from '@/components/ui/tags-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import {
  addDictionaryItem,
  getDictionaryItems,
  updateDictionaryItem,
  deleteDictionaryItem,
} from '@/services/dictionary-services';
import {
  DictionaryItem,
  CreateDictionaryItemPayload,
} from '@/types/dictionary-types';
import { DirectoryItem } from '@/types/directory-type';
import { DifficultyBar } from './difficulty-bar';
import { Textarea } from '@/components/ui/textarea';
import { ColorThemeProvider } from '@/providers/color-theme-provider';
import { useTheme } from 'next-themes';
import { merge } from '@/utils/merge-classes';

interface DictionaryFeatureProps {
  directoryId: string;
  onDirectoryItemRemoved: (itemId: string) => void;
  itemData: DirectoryItem;
  width: number;
  height: number;
}

const COLORS = ['blue', 'green', 'orange', 'neutral'];

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

export default function DictionaryFeature({
  directoryId,
  onDirectoryItemRemoved,
  itemData,
  width,
  height,
}: DictionaryFeatureProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<
    DictionaryItem[]
  >([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRandomDialogOpen, setIsRandomDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // <-- Added state for removal confirmation:
  const [
    isRemoveDictionaryDialogOpen,
    setIsRemoveDictionaryDialogOpen,
  ] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<
    number | null
  >(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(
    null
  );
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newVisibleText, setNewVisibleText] = useState('');
  const [newHiddenText, setNewHiddenText] = useState('');
  const [newDifficulty, setNewDifficulty] = useState(50);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [editingItem, setEditingItem] =
    useState<DictionaryItem | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    if (user && directoryId) {
      const fetchItems = async () => {
        try {
          const fetchedItems = await getDictionaryItems(
            user.uid,
            directoryId
          );
          setItems(fetchedItems);
          setFilteredItems(fetchedItems);
        } catch (error) {
          console.error('Error fetching dictionary items:', error);
        }
      };
      fetchItems();
    }
  }, [user, directoryId]);

  useEffect(() => {
    const filtered = items.filter((item) => {
      const matchesSearch =
        item.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag =
        selectedTag === 'all' || item.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
    setFilteredItems(filtered);
  }, [searchQuery, selectedTag, items]);

  const selectRandomItem = (items: DictionaryItem[]) => {
    const totalWeight = items.reduce(
      (sum, item) => sum + (item.difficulty + 1),
      0
    );
    let randomWeight = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      randomWeight -= items[i].difficulty + 1;
      if (randomWeight <= 0) return i;
    }
    return 0;
  };

  const handleCreateItem = async () => {
    if (
      !user ||
      !newTitle ||
      !newText ||
      !newVisibleText ||
      !newHiddenText
    )
      return;
    try {
      const payload: CreateDictionaryItemPayload = {
        title: newTitle,
        text: newText,
        visibleText: newVisibleText,
        hiddenText: newHiddenText,
        difficulty: newDifficulty,
        tags: newTags,
        color: newColor,
      };
      const newItemId = await addDictionaryItem(
        user.uid,
        directoryId,
        payload
      );
      const newItem: DictionaryItem = {
        id: newItemId,
        ...payload,
        createdAt: new Date(),
      };
      setItems((prev) => [...prev, newItem]);
      setNewTitle('');
      setNewText('');
      setNewVisibleText('');
      setNewHiddenText('');
      setNewDifficulty(50);
      setNewTags([]);
      setNewColor(COLORS[0]);
      setIsCreateDialogOpen(false);
      toast({ title: 'Item created successfully.' });
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: 'Could not create item.',
        variant: 'destructive',
      });
    }
  };

  const handleEditItem = async () => {
    if (!user || !editingItem) return;
    try {
      await updateDictionaryItem(
        user.uid,
        directoryId,
        editingItem.id,
        {
          title: editingItem.title,
          text: editingItem.text,
          visibleText: editingItem.visibleText,
          hiddenText: editingItem.hiddenText,
          difficulty: editingItem.difficulty,
          tags: editingItem.tags,
          color: editingItem.color,
        }
      );
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? editingItem : item
        )
      );
      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({ title: 'Item updated successfully.' });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Could not update item.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!user || !itemToDelete) return;
    try {
      await deleteDictionaryItem(user.uid, directoryId, itemToDelete);
      setItems((prev) => {
        const newItems = prev.filter(
          (item) => item.id !== itemToDelete
        );
        if (
          selectedItemIndex !== null &&
          items[selectedItemIndex]?.id === itemToDelete
        ) {
          setIsRandomDialogOpen(false);
          setSelectedItemIndex(null);
        } else if (selectedItemIndex !== null) {
          const deletedIdx = items.findIndex(
            (item) => item.id === itemToDelete
          );
          setSelectedItemIndex((prevIdx) =>
            prevIdx && prevIdx > deletedIdx ? prevIdx - 1 : prevIdx
          );
        }
        return newItems;
      });
      toast({ title: 'Item deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Could not delete item.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenItem = (index: number) => {
    setSelectedItemIndex(index);
    setIsFlipped(false);
    setIsRandomDialogOpen(true);
  };

  const handleNextItem = () => {
    if (
      selectedItemIndex !== null &&
      selectedItemIndex < filteredItems.length - 1
    ) {
      setSelectedItemIndex(selectedItemIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePreviousItem = () => {
    if (selectedItemIndex !== null && selectedItemIndex > 0) {
      setSelectedItemIndex(selectedItemIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRandomize = () => {
    if (filteredItems.length > 0) {
      setSelectedItemIndex(selectRandomItem(filteredItems));
      setIsFlipped(false);
      setIsRandomDialogOpen(true);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const allTags = Array.from(
    new Set(items.flatMap((item) => item.tags))
  );

  return (
    <div
      style={{ position: 'relative', height: 'calc(100% - 2rem)' }}
    >
      <style>
        {`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          .card-container:hover .flippable-card {
            transform: rotateY(10deg);
          }
          .card-container:hover .flippable-card.rotate-y-180 {
            transform: rotateY(170deg);
          }
        `}
      </style>

      <Menubar className="directory-item-drag-handle cursor-grab py-4 relative z-10 px-6 border border-border rounded-t-xl bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ghost"
            className="bg-muted h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsCreateDialogOpen(true)}>
              Add Item
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleRandomize}>
              Randomize Game
              <MenubarShortcut>
                <Play size={14} />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => setIsFullscreen(true)}>
              Fullscreen
              <MenubarShortcut>
                <Maximize2 size={14} />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            {/* Modified: Open confirm dialog before removing dictionary */}
            <MenubarItem
              onClick={() => setIsRemoveDictionaryDialogOpen(true)}
              variant="destructive"
            >
              Remove Dictionary
              <MenubarShortcut>
                <Trash2 className="text-red-500" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="relative bg-card flex flex-col h-full border-l border-r border-b border-border">
        {!isFullscreen && items.length > 0 && width > 5 && (
          <div className="p-4">
            <div className="flex gap-7 w-full">
              <div className="w-2/3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or text..."
                  className=""
                />
              </div>

              <div className="w-1/3">
                <Select
                  value={selectedTag}
                  onValueChange={setSelectedTag}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tag to filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {!isFullscreen && (
          <div className="w-full p-4 flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="py-1 pt-4 flex flex-wrap gap-8">
                <p className="text-sm text-muted-foreground text-center">
                  {searchQuery || selectedTag !== 'all'
                    ? 'No items match your search or filter.'
                    : 'No items added yet.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className={merge(
                        'cursor-pointer hover:bg-muted',
                        item.color === 'neutral'
                          ? 'bg-card'
                          : themeClassMapping[item.color]
                      )}
                      onClick={() => handleOpenItem(index)}
                    >
                      <TableCell className="py-2 px-1">
                        <h3 className="text-foreground text-md font-semibold">
                          {item.title}
                        </h3>
                      </TableCell>
                      <TableCell className="py-2 px-1">
                        <p className="text-sm text-muted-foreground">
                          {item.text}
                        </p>
                      </TableCell>
                      {width > 6 && height > 3 && (
                        <TableCell className="py-2 px-1">
                          {item.tags.length > 0 && (
                            <ColorThemeProvider>
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </ColorThemeProvider>
                          )}
                        </TableCell>
                      )}
                      {width > 6 && height > 3 && (
                        <TableCell className="py-4 text-center">
                          <DifficultyBar
                            value={item.difficulty}
                            className="w-32 mx-auto"
                          />
                        </TableCell>
                      )}
                      <TableCell
                        className="py-4"
                        onClick={stopPropagation}
                      >
                        <Menubar className="border-none bg-transparent p-0 justify-end">
                          <MenubarMenu>
                            <MenubarTrigger
                              variant="ellipsis"
                              className="p-1 h-0"
                            >
                              <Ellipsis size={18} />
                            </MenubarTrigger>
                            <MenubarContent>
                              <MenubarItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItem(item);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                Edit
                                <MenubarShortcut>
                                  <Edit size={14} />
                                </MenubarShortcut>
                              </MenubarItem>
                              <MenubarItem
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToDelete(item.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                                <MenubarShortcut>
                                  <Trash2
                                    size={14}
                                    className="text-red-500"
                                  />
                                </MenubarShortcut>
                              </MenubarItem>
                            </MenubarContent>
                          </MenubarMenu>
                        </Menubar>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="min-w-[90%] min-h-[80%] p-0 rounded-t-2xl"
          style={{ height: '90vh' }}
        >
          <Menubar className="cursor-grab h-8 z-10 px-6 bg-muted flex justify-between">
            <MenubarMenu>
              <MenubarTrigger
                variant="ghost"
                className="bg-muted h-4 p-1 absolute right-6"
              >
                <Ellipsis size={23} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Add Item
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={handleRandomize}>
                  Randomize Game
                  <MenubarShortcut>
                    <Play size={14} />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setIsFullscreen(false)}>
                  Exit Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                {/* Modified: Open confirm dialog before removing dictionary */}
                <MenubarItem
                  onClick={() =>
                    setIsRemoveDictionaryDialogOpen(true)
                  }
                  variant="destructive"
                >
                  Remove Dictionary
                  <MenubarShortcut>
                    <Trash2 className="text-red-500" size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <div className="w-full p-4 overflow-y-auto h-[calc(100%-2rem)]">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                No items yet. Create one to start.
              </p>
            ) : (
              <ul>
                {filteredItems.map((item, index) => (
                  <li
                    key={item.id}
                    className={merge(
                      'flex w-full items-center duration-200 justify-between px-2 py-1 border-b border-border cursor-pointer hover:bg-muted',
                      item.color === 'neutral'
                        ? 'bg-card'
                        : themeClassMapping[item.color]
                    )}
                    style={{
                      backgroundColor:
                        item.color === 'neutral'
                          ? 'hsl(var(--card))'
                          : theme === 'light'
                          ? lightBgMapping[item.color]
                          : bgColorMapping[item.color],
                    }}
                    onClick={() => handleOpenItem(index)}
                  >
                    <div className="flex items-center gap-10">
                      <div>
                        <h3
                          className={merge(
                            'text-lg font-semibold',
                            item.color === 'neutral' &&
                              theme === 'light'
                              ? 'text-black'
                              : 'text-white'
                          )}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={merge(
                            'text-sm text-muted-foreground',
                            item.color === 'neutral' &&
                              theme === 'light'
                              ? 'text-black'
                              : 'text-white'
                          )}
                        >
                          {item.text}
                        </p>
                      </div>
                      <p
                        className={merge(
                          'text-sm text-muted-foreground',
                          item.color === 'neutral' &&
                            theme === 'light'
                            ? 'text-black'
                            : 'text-white'
                        )}
                      >
                        {item.visibleText}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-5">
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2">
                        <DifficultyBar
                          value={item.difficulty}
                          className="w-32"
                        />
                      </div>
                      <Menubar
                        className="border-none bg-transparent p-0"
                        onClick={stopPropagation}
                      >
                        <MenubarMenu>
                          <MenubarTrigger
                            variant="ellipsis"
                            className="p-1 h-0"
                          >
                            <Ellipsis size={18} />
                          </MenubarTrigger>
                          <MenubarContent>
                            <MenubarItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(item);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              Edit
                              <MenubarShortcut>
                                <Edit size={14} />
                              </MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete(item.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                              <MenubarShortcut>
                                <Trash2
                                  size={14}
                                  className="text-red-500"
                                />
                              </MenubarShortcut>
                            </MenubarItem>
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Enter the details for your new dictionary item.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="block mb-2 mt-4">Title</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Item Title"
            />
            <Label className="block mb-2 mt-4">Text</Label>
            <Textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Additional Text"
            />
            <Label className="block mb-2 mt-4">Visible Text</Label>
            <Textarea
              value={newVisibleText}
              onChange={(e) => setNewVisibleText(e.target.value)}
              placeholder="Visible Text"
            />
            <Label className="block mb-2 mt-4">Hidden Text</Label>
            <Textarea
              value={newHiddenText}
              onChange={(e) => setNewHiddenText(e.target.value)}
              placeholder="Hidden Text"
            />
            <Label className="block mb-2 mt-4">Difficulty</Label>
            <Slider
              value={[newDifficulty]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setNewDifficulty(value[0])}
              className="w-full mt-4"
            />
            <Label className="block mb-2 mt-4">Tags</Label>
            <TagsInput
              value={newTags}
              onChange={setNewTags}
              placeholder="Type to add tags..."
            />
            <div className="flex gap-2 items-center justify-between mt-4">
              <Label className="block text-sm font-medium text-muted-foreground">
                Card Color
              </Label>
              <div className="flex gap-2 items-center">
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
                      onClick={() => setNewColor(c)}
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
                              : 'hsl(var(--card))',
                        }}
                      >
                        {newColor === c && (
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
          </div>
          <Button className="w-full mt-4" onClick={handleCreateItem}>
            Create Item
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Modify the details of your dictionary item.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div>
              <Label className="block mb-2 mt-4">Title</Label>
              <Input
                value={editingItem.title}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                placeholder="Item Title"
              />
              <Label className="block mb-2 mt-4">Text</Label>
              <Textarea
                value={editingItem.text}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, text: e.target.value } : null
                  )
                }
                placeholder="Additional Text"
              />
              <Label className="block mb-2 mt-4">Visible Text</Label>
              <Textarea
                value={editingItem.visibleText}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev
                      ? { ...prev, visibleText: e.target.value }
                      : null
                  )
                }
                placeholder="Visible Text"
              />
              <Label className="block mb-2 mt-4">Hidden Text</Label>
              <Textarea
                value={editingItem.hiddenText}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev
                      ? { ...prev, hiddenText: e.target.value }
                      : null
                  )
                }
                placeholder="Hidden Text"
              />
              <Label className="block mb-2 mt-4">Difficulty</Label>
              <Slider
                value={[editingItem.difficulty]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, difficulty: value[0] } : null
                  )
                }
              />
              <Label className="block mb-2 mt-4">Tags</Label>
              <TagsInput
                value={editingItem.tags}
                onChange={(tags) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, tags } : null
                  )
                }
                placeholder="Type to add tags..."
              />
              <div className="flex gap-2 items-center justify-between mt-4">
                <Label className="block text-sm font-medium text-muted-foreground">
                  Card Color
                </Label>
                <div className="flex gap-2 items-center">
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
                        onClick={() =>
                          setEditingItem((prev) =>
                            prev ? { ...prev, color: c } : null
                          )
                        }
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
                                : 'hsl(var(--card))',
                          }}
                        >
                          {editingItem.color === c && (
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
            </div>
          )}
          <Button className="w-full mt-4" onClick={handleEditItem}>
            Update Item
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRandomDialogOpen}
        onOpenChange={setIsRandomDialogOpen}
      >
        <DialogContent className="max-w-[550px] max-h-[500px] m-30 text-foreground rounded-lg border border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {selectedItemIndex !== null &&
                filteredItems[selectedItemIndex]?.title}
            </DialogTitle>
            <DialogDescription className="text-foreground/70 text-center">
              {selectedItemIndex !== null &&
                filteredItems[selectedItemIndex]?.text}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 relative">
            {selectedItemIndex !== null && (
              <>
                <div className="relative perspective-1000 card-container">
                  <div
                    className={merge(
                      'relative w-full h-48 transition-transform duration-500 rounded-lg transform-style-preserve-3d flippable-card',
                      isFlipped ? 'rotate-y-180' : '',
                      filteredItems[selectedItemIndex]?.color ===
                        'neutral'
                        ? 'bg-card border border-border'
                        : themeClassMapping[
                            filteredItems[selectedItemIndex]?.color
                          ]
                    )}
                    style={{
                      backgroundColor:
                        filteredItems[selectedItemIndex]?.color ===
                        'neutral'
                          ? 'hsl(var(--card))'
                          : theme === 'light'
                          ? lightBgMapping[
                              filteredItems[selectedItemIndex]?.color
                            ]
                          : bgColorMapping[
                              filteredItems[selectedItemIndex]?.color
                            ],
                    }}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div className="cursor-pointer absolute w-full h-full rounded-lg p-4 flex flex-col justify-between backface-hidden">
                      <p
                        className={merge(
                          'text-lg mt-4',
                          filteredItems[selectedItemIndex]?.color ===
                            'neutral' && theme === 'light'
                            ? 'text-black'
                            : 'text-white'
                        )}
                      >
                        {filteredItems[selectedItemIndex].visibleText}
                      </p>
                      <Menubar
                        className="absolute top-2 right-2 border-none bg-transparent p-0"
                        onClick={stopPropagation}
                      >
                        <MenubarMenu>
                          <MenubarTrigger
                            variant="ellipsis"
                            className="p-1 h-0 top-2 absolute right-2"
                          >
                            <Ellipsis
                              size={18}
                              className={
                                filteredItems[selectedItemIndex]
                                  ?.color === 'neutral' &&
                                theme === 'light'
                                  ? 'text-black'
                                  : 'text-white'
                              }
                            />
                          </MenubarTrigger>
                          <MenubarContent>
                            <MenubarItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(
                                  filteredItems[selectedItemIndex]
                                );
                                setIsEditDialogOpen(true);
                              }}
                            >
                              Edit
                              <MenubarShortcut>
                                <Edit size={14} />
                              </MenubarShortcut>
                            </MenubarItem>
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                    </div>
                    <div
                      style={{
                        backgroundColor:
                          filteredItems[selectedItemIndex]?.color ===
                          'neutral'
                            ? 'hsl(var(--card))'
                            : theme === 'light'
                            ? lightBgMapping[
                                filteredItems[selectedItemIndex]
                                  ?.color
                              ]
                            : bgColorMapping[
                                filteredItems[selectedItemIndex]
                                  ?.color
                              ],
                      }}
                      className="cursor-pointer absolute w-full h-full rounded-lg p-4 flex flex-col justify-between backface-hidden rotate-y-180"
                    >
                      <p
                        className={merge(
                          'text-lg mt-4',
                          filteredItems[selectedItemIndex]?.color ===
                            'neutral' && theme === 'light'
                            ? 'text-black'
                            : 'text-white'
                        )}
                      >
                        {filteredItems[selectedItemIndex].hiddenText}
                      </p>
                      <Menubar
                        className="absolute top-2 right-2 border-none bg-transparent p-0"
                        onClick={stopPropagation}
                      >
                        <MenubarMenu>
                          <MenubarTrigger
                            variant="ellipsis"
                            className="p-1 h-0 top-2 absolute right-2"
                          >
                            <Ellipsis
                              size={18}
                              className={
                                filteredItems[selectedItemIndex]
                                  ?.color === 'neutral' &&
                                theme === 'light'
                                  ? 'text-black'
                                  : 'text-white'
                              }
                            />
                          </MenubarTrigger>
                          <MenubarContent>
                            <MenubarItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(
                                  filteredItems[selectedItemIndex]
                                );
                                setIsEditDialogOpen(true);
                              }}
                            >
                              Edit
                              <MenubarShortcut>
                                <Edit size={14} />
                              </MenubarShortcut>
                            </MenubarItem>
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="flex flex-col justify-between gap-2">
                      <Label className="text-foreground/70">
                        Tags
                      </Label>
                      <ColorThemeProvider>
                        {filteredItems[selectedItemIndex].tags
                          .length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {filteredItems[
                              selectedItemIndex
                            ].tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </ColorThemeProvider>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Label className="text-foreground/70">
                        Difficulty:
                      </Label>
                      <DifficultyBar
                        value={
                          filteredItems[selectedItemIndex].difficulty
                        }
                        className="w-32 mt-0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-8">
                  <Button
                    variant="ghost"
                    onClick={handlePreviousItem}
                    disabled={
                      selectedItemIndex === null ||
                      selectedItemIndex === 0
                    }
                    className="inline-flex items-center justify-center duration-300 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 border border-border bg-white hover:bg-accent hover:text-slate-900 dark:bg-slate-950 dark:hover:bg-accent dark:hover:text-slate-50 h-10 px-4 py-2"
                  >
                    <MoveLeft size={16} className="mr-2" /> Previous
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleRandomize}
                    className="inline-flex items-center justify-center duration-300 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 border border-border bg-white hover:bg-accent hover:text-slate-900 dark:bg-slate-950 dark:hover:bg-accent dark:hover:text-slate-50 h-10 px-4 py-2"
                  >
                    Random
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleNextItem}
                    disabled={
                      selectedItemIndex === null ||
                      selectedItemIndex === filteredItems.length - 1
                    }
                    className="inline-flex items-center justify-center duration-300 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 border border-border bg-white hover:bg-accent hover:text-slate-900 dark:bg-slate-950 dark:hover:bg-accent dark:hover:text-slate-50 h-10 px-4 py-2"
                  >
                    Next <MoveRight size={16} className="ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Confirm Dialog for Removing Dictionary */}
      <Dialog
        open={isRemoveDictionaryDialogOpen}
        onOpenChange={setIsRemoveDictionaryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Remove Dictionary</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this dictionary? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRemoveDictionaryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDirectoryItemRemoved(itemData.id);
                setIsRemoveDictionaryDialogOpen(false);
              }}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

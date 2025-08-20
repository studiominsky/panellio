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
  Maximize2,
  Trash2,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  List,
  Heading1,
  Heading2,
  Edit,
  Trash,
  Code,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagsInput } from '@/components/ui/tags-input';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import { DirectoryItem } from '@/types/directory-type';
import {
  addNote,
  deleteNotes,
  getNotes,
  updateNote,
  deleteNote,
} from '@/services/notes-services';
import { CreateNotePayload, Note } from '@/types/notes-types';
import {
  useEditor,
  EditorContent,
  Editor,
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import CodeExtension from '@tiptap/extension-code';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, all } from 'lowlight';
import { Label } from '@/components/ui/label';

const lowlight = createLowlight(all);

const CodeBlockComponent = () => {
  return (
    <NodeViewWrapper className="code-block">
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

const CustomToolbar = ({
  editor,
  width,
  height,
}: {
  editor: Editor | null;
  width: number;
  height: number;
}) => {
  if (!editor || width < 5 || height < 5) return null;
  return (
    <div
      className={`flex justify-end gap-2 bg-card rounded-md relative  ${
        width < 8 ? 'relative justify-start' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded ${
          editor.isActive('bold') ? 'bg-muted' : ''
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded ${
          editor.isActive('italic') ? 'bg-muted' : ''
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded ${
          editor.isActive('underline') ? 'bg-muted' : ''
        }`}
        title="Underline"
      >
        <Underline size={16} />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
        className={`p-1 rounded ${
          editor.isActive('orderedList') ? 'bg-muted' : ''
        }`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleBulletList().run()
        }
        className={`p-1 rounded ${
          editor.isActive('bulletList') ? 'bg-muted' : ''
        }`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={`p-1 rounded ${
          editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''
        }`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`p-1 rounded ${
          editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''
        }`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1 rounded ${
          editor.isActive('codeBlock') ? 'bg-muted' : ''
        }`}
        title="Code Block"
      >
        <Code size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-1 rounded ${
          editor.isActive('paragraph') ? 'bg-muted' : ''
        }`}
        title="Normal Text"
      >
        <span className="text-sm">P</span>
      </button>
    </div>
  );
};

interface NotesFeatureProps {
  directoryId: string;
  onDirectoryItemRemoved: (itemId: string) => void;
  itemData: DirectoryItem;
  width: number;
  height: number;
}

export default function NotesFeature({
  directoryId,
  onDirectoryItemRemoved,
  itemData,
  width,
  height,
}: NotesFeatureProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    null
  );
  const [isCreateNoteDialogOpen, setIsCreateNoteDialogOpen] =
    useState(false);
  const [isDeleteNotesDialogOpen, setIsDeleteNotesDialogOpen] =
    useState(false);
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] =
    useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(
    null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditTitleDialogOpen, setIsEditTitleDialogOpen] =
    useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);

  const regularEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
        codeBlock: false,
      }),
      UnderlineExtension,
      CodeExtension,
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
    ],
    content: '',
    editable: false,
  });
  const fullscreenEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
        codeBlock: false,
      }),
      UnderlineExtension,
      CodeExtension,
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
    ],
    content: '',
    editable: false,
  });

  useEffect(() => {
    if (selectedNoteId) {
      const selectedNote = notes.find((n) => n.id === selectedNoteId);
      const content =
        selectedNote?.content || '<p>Click to edit...</p>';
      regularEditor?.commands.setContent(content);
      regularEditor?.setEditable(isEditing);
      fullscreenEditor?.commands.setContent(content);
      fullscreenEditor?.setEditable(isEditing);
      setEditedTags(selectedNote?.tags || []);
    }
  }, [
    selectedNoteId,
    notes,
    isEditing,
    regularEditor,
    fullscreenEditor,
  ]);

  useEffect(() => {
    if (user && directoryId) {
      const fetchNotes = async () => {
        try {
          const fetchedNotes = await getNotes(user.uid, directoryId);
          setNotes(fetchedNotes);
          if (fetchedNotes.length > 0) {
            setSelectedNoteId(fetchedNotes[0].id);
          }
        } catch (error) {
          console.error('Error fetching notes:', error);
        }
      };
      fetchNotes();
    }
  }, [user, directoryId]);

  const handleCreateNote = async (title: string, tags: string[]) => {
    if (!user) return;
    try {
      const payload: CreateNotePayload = { title, content: '', tags };
      const newNoteId = await addNote(user.uid, directoryId, payload);
      const newNote: Note = {
        id: newNoteId,
        title,
        content: '',
        tags,
        createdAt: new Date(),
      };
      setNotes((prev) => [...prev, newNote]);
      setSelectedNoteId(newNoteId);
      setIsCreateNoteDialogOpen(false);
      toast({ title: 'Note created successfully.' });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Could not create note.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateNote = async (
    noteId: string,
    content: string,
    title?: string,
    tags?: string[]
  ) => {
    if (!user) return;
    try {
      await updateNote(user.uid, directoryId, noteId, {
        content,
        ...(title ? { title } : {}),
        ...(tags ? { tags } : {}),
      });
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? {
                ...note,
                content,
                title: title || note.title,
                tags: tags || note.tags,
              }
            : note
        )
      );
      toast({ title: 'Note updated successfully.' });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Could not update note.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      await deleteNote(user.uid, directoryId, noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (selectedNoteId === noteId) setSelectedNoteId(null);
      toast({ title: 'Note deleted successfully.' });
      setIsDeleteNoteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Could not delete note.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotes = async () => {
    if (!user) return;
    try {
      await deleteNotes(user.uid, directoryId);
      setNotes([]);
      setSelectedNoteId(null);
      onDirectoryItemRemoved(itemData.id);
      toast({ title: 'Notes removed successfully.' });
      setIsDeleteNotesDialogOpen(false);
    } catch (error) {
      console.error('Error removing notes:', error);
      toast({
        title: 'Could not remove notes.',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      note.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  useEffect(() => {
    if (!isFullscreen && regularEditor && fullscreenEditor) {
      const content = fullscreenEditor.getHTML();
      regularEditor.commands.setContent(content);
    }
  }, [isFullscreen, regularEditor, fullscreenEditor]);

  const renderEditor = (container: 'regular' | 'fullscreen') => {
    const selectedNote = notes.find((n) => n.id === selectedNoteId);
    if (!selectedNote) return null;
    const activeEditor =
      container === 'regular' ? regularEditor : fullscreenEditor;
    return (
      <div
        className={`flex flex-col h-full ${
          width < 6 ? 'gap-1' : 'gap-4'
        }`}
      >
        <h2
          className={`font-semibold text-start ${
            width < 8 ? 'px-3 text-xl' : 'px-3 text-2xl mt-2'
          }`}
        >
          {selectedNote.title}
        </h2>
        {isEditing && (
          <CustomToolbar
            editor={activeEditor}
            width={width}
            height={height}
          />
        )}
        <div
          className={`tiptap rounded-md p-4 text-start overflow-y-auto flex-1 ${
            isEditing
              ? 'outline outline-1 outline-[var(--ui-primary)]'
              : ''
          }`}
          onClick={() => {
            setIsEditing(true);
            activeEditor?.setEditable(true);
          }}
        >
          <EditorContent editor={activeEditor} />
        </div>
        <div className="flex justify-between items-start">
          {width > 6 && (
            <div className="py-2">
              {selectedNote.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No tags
                </span>
              )}
            </div>
          )}
          {isEditing && (
            <div className="flex gap-2 justify-end ml-auto">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditedTitle(selectedNote.title);
                  setEditedTags(selectedNote.tags || []);
                  setIsEditTitleDialogOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedNoteId && activeEditor) {
                    handleUpdateNote(
                      selectedNoteId,
                      activeEditor.getHTML() || ''
                    );
                    setIsEditing(false);
                    regularEditor?.setEditable(false);
                    fullscreenEditor?.setEditable(false);
                  }
                }}
              >
                Save Note
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNoteList = () => {
    if (width <= 6) return null;
    return (
      <div className="w-1/4 border-r border-border p-4 overflow-y-auto">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`text-sm flex justify-between items-center p-1 px-2 mb-2 cursor-pointer rounded-lg ${
              selectedNoteId === note.id
                ? 'bg-muted'
                : 'hover:bg-muted'
            }`}
            onClick={() => {
              setSelectedNoteId(note.id);
              setIsEditing(false);
            }}
          >
            <span className="text-left truncate">
              {note.title || 'Untitled Note'}
            </span>
            <Menubar className="border-none bg-transparent p-0">
              <MenubarMenu>
                <MenubarTrigger variant="ghost" className="p-1">
                  <Ellipsis size={18} />
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setEditedTitle(note.title);
                      setEditedTags(note.tags || []);
                      setIsEditTitleDialogOpen(true);
                    }}
                  >
                    Edit Note
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    variant="destructive"
                    onClick={() => {
                      setNoteToDelete(note.id);
                      setIsDeleteNoteDialogOpen(true);
                    }}
                  >
                    Delete
                    <MenubarShortcut>
                      <Trash size={14} className="text-red-500" />
                    </MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{ position: 'relative', height: 'calc(100% - 2rem)' }}
    >
      <Menubar className="directory-item-drag-handle cursor-grab py-4 relative z-10 px-6 border border-border rounded-t-xl bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ghost"
            className="bg-muted h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => setIsCreateNoteDialogOpen(true)}
            >
              Add Note
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => setIsFullscreen(true)}>
              Fullscreen
              <MenubarShortcut>
                <Maximize2 size={14} />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              onClick={() => setIsDeleteNotesDialogOpen(true)}
              variant="destructive"
            >
              Remove Notes
              <MenubarShortcut>
                <Trash2 className="text-red-500" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="relative bg-card flex h-full border-l border-r border-b border-border">
        {notes.length > 0 && !isFullscreen && renderNoteList()}

        {!isFullscreen && (
          <div
            className={`${
              notes.length > 0
                ? width <= 6
                  ? 'w-full'
                  : 'w-3/4'
                : 'w-full'
            } p-4`}
          >
            {notes.length === 0 ? (
              <div className="py-1 pt-4 flex flex-wrap gap-8">
                <p className="text-sm text-center text-muted-foreground">
                  No notes added yet.
                </p>
              </div>
            ) : selectedNoteId ? (
              renderEditor('regular')
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a note to view or edit.
              </p>
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
                  onClick={() => setIsCreateNoteDialogOpen(true)}
                >
                  Add Note
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setIsFullscreen(false)}>
                  Exit Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  onClick={() => setIsDeleteNotesDialogOpen(true)}
                  variant="destructive"
                >
                  Remove Notes
                  <MenubarShortcut>
                    <Trash2 className="text-red-500" size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <div className="flex h-[calc(100%-2rem)] relative">
            {notes.length > 0 && renderNoteList()}
            <div className={`${width <= 6 ? 'w-full' : 'w-3/4'} p-4`}>
              {selectedNoteId ? (
                renderEditor('fullscreen')
              ) : (
                <div className="py-1 pt-4 flex flex-wrap gap-8">
                  <p className="text-sm text-center text-muted-foreground">
                    No notes added yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditTitleDialogOpen}
        onOpenChange={setIsEditTitleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Modify the note title and tags below.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
              Title
            </Label>
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
            />
            <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
              Tags
            </Label>
            <TagsInput
              value={editedTags}
              onChange={setEditedTags}
              placeholder="Type to add tags..."
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button
              className="w-full mt-4"
              onClick={async () => {
                if (selectedNoteId) {
                  await handleUpdateNote(
                    selectedNoteId,
                    regularEditor?.getHTML() || '',
                    editedTitle,
                    editedTags
                  );
                  setIsEditTitleDialogOpen(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateNoteDialogOpen}
        onOpenChange={setIsCreateNoteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Enter the title and tags for your new note.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const title = (
                e.currentTarget.elements.namedItem(
                  'title'
                ) as HTMLInputElement
              ).value;
              handleCreateNote(title, editedTags);
            }}
          >
            <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
              Title
            </Label>
            <Input name="title" placeholder="Note Title" />
            <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
              Tags
            </Label>
            <TagsInput
              value={editedTags}
              onChange={setEditedTags}
              placeholder="Type to add tags..."
            />
            <Button type="submit" className="w-full mt-4">
              Create Note
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteNotesDialogOpen}
        onOpenChange={setIsDeleteNotesDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove All Notes</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all notes? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              className="mr-2"
              onClick={() => setIsDeleteNotesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotes}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteNoteDialogOpen}
        onOpenChange={setIsDeleteNoteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              className="mr-2"
              onClick={() => setIsDeleteNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                noteToDelete && handleDeleteNote(noteToDelete)
              }
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { UploadFile } from '@/components/assets/upload-file';
import { toast } from '@/hooks/use-toast';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSeparator,
} from '../ui/context-menu';
import {
  File as FileIcon,
  ImageIcon,
  FileJson,
  Trash2,
  FolderPen,
  Ellipsis,
  Maximize2,
  ArrowLeft,
  FolderIcon,
} from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarShortcut,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarRadioGroup,
  MenubarRadioItem,
} from '../ui/menubar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useColorTheme } from '@/hooks/use-color-theme';
import { Folder, FileData } from '@/types/file-type';
import { useTheme } from 'next-themes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { deleteAssets } from '@/services/assets-service';
import { LoadingSpinner } from '../ui/loading-spinner';
import { DirectoryItem } from '@/types/directory-type';

type ColorTheme = 'orange' | 'green' | 'blue' | 'light' | 'dark';

const themeColors = {
  orange: { light: 'var(--orange-500)', dark: 'var(--orange-400)' },
  green: { light: 'var(--green-500)', dark: 'var(--green-400)' },
  blue: { light: 'var(--blue-500)', dark: 'var(--blue-400)' },
  light: { light: 'var(--primary)', dark: 'var(--primary)' },
  dark: { light: 'var(--primary)', dark: 'var(--primary)' },
};

interface ListFilesAndFoldersProps {
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
}

export const ListFilesAndFolders: React.FC<
  ListFilesAndFoldersProps
> = ({ directoryId, onDirectoryItemRemoved, itemData }) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<{ [key: string]: FileData[] }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFolderId, setSelectedFolderId] = useState<
    string | null
  >(null);
  const [renamingItem, setRenamingItem] = useState<string | null>(
    null
  );
  const [renamingType, setRenamingType] = useState<
    'file' | 'folder' | null
  >(null);
  const [newName, setNewName] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    type: 'file' | 'folder';
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isEnlargedDialogOpen, setIsEnlargedDialogOpen] =
    useState(false);
  const [oldName, setOldName] = useState<string>('');
  const [isRenameDisabled, setIsRenameDisabled] = useState(false);
  const [renameError, setRenameError] = useState<string>('');
  const [isAddFolderDisabled, setIsAddFolderDisabled] =
    useState(false);
  const [addFolderError, setAddFolderError] = useState<string>('');
  const { theme: systemTheme } = useTheme();
  const [colorTheme] = useColorTheme();
  const [fillColor, setFillColor] = useState('');
  const [isDeleteAssetsDialogOpen, setIsDeleteAssetsDialogOpen] =
    useState(false);

  // View mode states
  const [directoryViewMode, setDirectoryViewMode] = useState<
    'list' | 'icons'
  >('icons');
  const [folderViewModes, setFolderViewModes] = useState<{
    [folderId: string]: 'list' | 'icons';
  }>({});
  const [viewMode, setViewMode] = useState<'list' | 'icons'>('icons');

  const menubarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const themeColor =
      themeColors[colorTheme as ColorTheme] || themeColors.light;
    setFillColor(
      systemTheme === 'dark' ? themeColor.dark : themeColor.light
    );
  }, [colorTheme, systemTheme]);

  useEffect(() => {
    const fetchDirectoryViewMode = async () => {
      if (!user || !directoryId) return;

      try {
        const docRef = doc(
          db,
          'users',
          user.uid,
          'directories',
          directoryId
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mode = data.viewMode || 'icons';
          setDirectoryViewMode(mode);
          setViewMode(mode);
        }
      } catch (error) {
        console.error('Failed to fetch directory view mode:', error);
      }
    };

    fetchDirectoryViewMode();
  }, [user, directoryId]);

  const fetchFolderViewMode = useCallback(
    async (folderId: string) => {
      if (!user || !directoryId) return;

      try {
        const docRef = doc(
          db,
          'users',
          user.uid,
          'directories',
          directoryId,
          'folders',
          folderId
        );
        const docSnap = await getDoc(docRef);
        let mode: 'list' | 'icons' = 'icons';
        if (docSnap.exists()) {
          const data = docSnap.data();
          mode = data.viewMode || 'icons';
        }
        setFolderViewModes((prev) => ({ ...prev, [folderId]: mode }));
        setViewMode(mode);
      } catch (error) {
        console.error('Failed to fetch folder view mode:', error);
      }
    },
    [user, directoryId]
  );

  const fetchFolders = useCallback(async () => {
    if (!user || !directoryId) return;

    setLoading(true);
    try {
      const directoryDocRef = doc(
        db,
        'users',
        user.uid,
        'directories',
        directoryId
      );
      const foldersRef = collection(directoryDocRef, 'folders');
      const folderSnapshots = await getDocs(foldersRef);

      const fetchedFolders: Folder[] = folderSnapshots.docs.map(
        (doc) => ({
          ...(doc.data() as Folder),
          id: doc.id,
        })
      );

      setFolders(fetchedFolders);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load folders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, directoryId]);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user, directoryId, fetchFolders]);

  const fetchFiles = useCallback(
    async (folderId: string) => {
      if (!user) return;

      setLoading(true);
      try {
        const folderRef = doc(
          db,
          'users',
          user.uid,
          'directories',
          directoryId,
          'folders',
          folderId
        );
        const filesRef = collection(folderRef, 'files');
        const fileSnapshots = await getDocs(filesRef);

        const fetchedFiles: FileData[] = fileSnapshots.docs.map(
          (doc) => ({
            ...(doc.data() as FileData),
            id: doc.id,
          })
        );

        setFiles((prevFiles) => ({
          ...prevFiles,
          [folderId]: fetchedFiles,
        }));

        const cachedViewMode = folderViewModes[folderId];
        if (cachedViewMode) {
          setViewMode(cachedViewMode);
        } else {
          setViewMode('icons');
        }

        setSelectedFolderId(folderId);

        fetchFolderViewMode(folderId);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load files',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [user, directoryId, fetchFolderViewMode, folderViewModes]
  );

  const handleAddFolder = async () => {
    if (!newFolderName.trim() || !user) {
      toast({
        title: 'Error',
        description: 'Folder name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const nameExists = folders.some(
      (folder) => folder.name === newFolderName.trim()
    );

    if (nameExists) {
      toast({
        title: 'Error',
        description: 'A folder with this name already exists',
        variant: 'destructive',
      });
      return;
    }

    try {
      const directoryDocRef = doc(
        db,
        'users',
        user.uid,
        'directories',
        directoryId
      );
      const foldersRef = collection(directoryDocRef, 'folders');
      await addDoc(foldersRef, { name: newFolderName });
      toast({ title: 'Folder created successfully' });
      setNewFolderName('');
      setIsFolderDialogOpen(false);
      fetchFolders();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create folder',
        variant: 'destructive',
      });
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || !renamingItem || !renamingType || !user) {
      toast({
        title: 'Error',
        description: 'Name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (newName.trim() === oldName.trim()) {
      toast({
        title: 'Error',
        description: 'Name has not changed',
        variant: 'destructive',
      });
      return;
    }

    // Check if name already exists
    if (renamingType === 'folder') {
      const nameExists = folders.some(
        (folder) => folder.name === newName.trim()
      );
      if (nameExists) {
        toast({
          title: 'Error',
          description: 'A folder with this name already exists',
          variant: 'destructive',
        });
        return;
      }
    } else {
      const currentFiles = files[selectedFolderId!] || [];
      const nameExists = currentFiles.some(
        (file) => file.name === newName.trim()
      );
      if (nameExists) {
        toast({
          title: 'Error',
          description: 'A file with this name already exists',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      const itemRef = doc(
        db,
        'users',
        user.uid,
        'directories',
        directoryId,
        renamingType === 'folder'
          ? 'folders'
          : `folders/${selectedFolderId}/files`,
        renamingItem
      );
      await updateDoc(itemRef, { name: newName });
      toast({
        title: `${
          renamingType.charAt(0).toUpperCase() + renamingType.slice(1)
        } renamed successfully`,
      });
      setRenamingItem(null);
      setNewName('');
      setIsRenameDialogOpen(false);

      renamingType === 'folder'
        ? fetchFolders()
        : fetchFiles(selectedFolderId!);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rename item',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!newName.trim()) {
      setIsRenameDisabled(true);
      setRenameError('Name cannot be empty');
      return;
    }
    if (newName.trim() === oldName.trim()) {
      setIsRenameDisabled(true);
      setRenameError('Name has not changed');
      return;
    }

    if (renamingType === 'folder') {
      const nameExists = folders.some(
        (folder) =>
          folder.name === newName.trim() && folder.id !== renamingItem
      );
      if (nameExists) {
        setIsRenameDisabled(true);
        setRenameError('A folder with this name already exists');
      } else {
        setIsRenameDisabled(false);
        setRenameError('');
      }
    } else if (renamingType === 'file') {
      const currentFiles = files[selectedFolderId!] || [];
      const nameExists = currentFiles.some(
        (file) =>
          file.name === newName.trim() && file.id !== renamingItem
      );
      if (nameExists) {
        setIsRenameDisabled(true);
        setRenameError('A file with this name already exists');
      } else {
        setIsRenameDisabled(false);
        setRenameError('');
      }
    } else {
      setIsRenameDisabled(false);
      setRenameError('');
    }
  }, [
    newName,
    oldName,
    renamingType,
    folders,
    files,
    selectedFolderId,
    renamingItem,
  ]);

  useEffect(() => {
    if (!newFolderName.trim()) {
      setIsAddFolderDisabled(true);
      setAddFolderError('Folder name cannot be empty');
      return;
    }

    const nameExists = folders.some(
      (folder) => folder.name === newFolderName.trim()
    );

    if (nameExists) {
      setIsAddFolderDisabled(true);
      setAddFolderError('A folder with this name already exists');
    } else {
      setIsAddFolderDisabled(false);
      setAddFolderError('');
    }
  }, [newFolderName, folders]);

  const [existingFileNames, setExistingFileNames] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (selectedFolderId) {
      const currentFiles = files[selectedFolderId] || [];
      const fileNames = currentFiles.map((file) => file.name);
      setExistingFileNames(fileNames);
    } else {
      setExistingFileNames([]);
    }
  }, [files, selectedFolderId]);

  const handleDelete = async () => {
    if (!deletingItem || !user) return;

    try {
      const { id, type } = deletingItem;
      const itemRef = doc(
        db,
        'users',
        user.uid,
        'directories',
        directoryId,
        type === 'folder'
          ? 'folders'
          : `folders/${selectedFolderId}/files`,
        id
      );
      await deleteDoc(itemRef);
      toast({
        title: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } deleted successfully`,
      });

      type === 'folder'
        ? fetchFolders()
        : fetchFiles(selectedFolderId!);

      if (selectedFolderId === id) {
        handleNavigateBack();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setDeletingItem(null);
    }
  };

  const handleDeleteAssets = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User is not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteAssets(user.uid, directoryId);

      toast({
        title: 'Success',
        description: 'Assets removed successfully!',
      });

      onDirectoryItemRemoved(itemData.id);
    } catch (error) {
      console.error('Error removing assets:', error);

      toast({
        title: 'Error',
        description: 'Failed to remove assets.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteAssetsDialogOpen(false);
    }
  };

  const handleContextMenu = (
    type: 'file' | 'folder',
    itemId: string,
    itemName: string,
    content: JSX.Element
  ) => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="flex flex-col gap-3"
          onClick={() => type === 'folder' && fetchFiles(itemId)}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            setRenamingItem(itemId);
            setRenamingType(type);
            setNewName(itemName);
            setOldName(itemName);
            setIsRenameDialogOpen(true);
          }}
        >
          Rename
          <ContextMenuShortcut>
            <FolderPen size={14} />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-red-500 focus:text-red-500"
          onClick={() => setDeletingItem({ id: itemId, type })}
        >
          Delete
          <ContextMenuShortcut>
            <Trash2
              size={14}
              className="text-red-500 focus:text-red-500"
            />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  const renderFolders = () => {
    if (viewMode === 'list') {
      return (
        <ul className="w-full py-1 pb-4">
          {folders.map((folder) => (
            <li
              key={folder.id}
              className="flex items-center gap-2 py-2 border-b border-border cursor-pointer"
              onClick={() => fetchFiles(folder.id)}
            >
              {handleContextMenu(
                'folder',
                folder.id,
                folder.name,
                <div className="flex items-center gap-2">
                  <svg
                    style={{ fill: fillColor }}
                    className="hover:scale-[1.1] transition duration-300"
                    width="20"
                    height="24"
                    viewBox="0 0 80 64"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M72 8H40L34.344 2.344C32.844 0.844 30.808 0 28.688 0H8C3.6 0 0 3.6 0 8V56C0 60.4 3.6 64 8 64H72C76.4 64 80 60.4 80 56V16C80 11.6 76.4 8 72 8Z" />
                  </svg>
                  <span className="text-sm">{folder.name}</span>
                </div>
              )}
            </li>
          ))}
          {folders.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No folders in this directory.
            </p>
          )}
        </ul>
      );
    } else {
      return (
        <div className="py-1 pt-4 flex flex-wrap gap-8">
          {folders.map((folder) => (
            <span
              key={folder.id}
              className="flex flex-col gap-3 items-center cursor-pointer"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fetchFiles(folder.id);
                  e.preventDefault();
                }
              }}
            >
              {handleContextMenu(
                'folder',
                folder.id,
                folder.name,
                <span
                  className="flex flex-col items-center gap-2"
                  style={{ width: '78px', minHeight: '100px' }}
                >
                  <svg
                    style={{ fill: fillColor }}
                    className="hover:scale-[1.1] transition duration-300"
                    width="80"
                    height="64"
                    viewBox="0 0 80 64"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M72 8H40L34.344 2.344C32.844 0.844 30.808 0 28.688 0H8C3.6 0 0 3.6 0 8V56C0 60.4 3.6 64 8 64H72C76.4 64 80 60.4 80 56V16C80 11.6 76.4 8 72 8Z" />
                  </svg>
                  <span
                    className="text-sm text-foreground/80 text-center whitespace-normal"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {folder.name.length > 10 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-sm text-foreground/80">
                              {folder.name.slice(0, 10)}...
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="border border-border text-foreground/80">
                            {folder.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <button className="text-sm text-foreground/80">
                        {folder.name}
                      </button>
                    )}
                  </span>
                </span>
              )}
            </span>
          ))}
          {folders.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No folders in this directory.
            </p>
          )}
        </div>
      );
    }
  };

  const renderFiles = () => {
    if (!selectedFolderId) return null;
    const currentFiles = files[selectedFolderId] || [];

    if (viewMode === 'list') {
      return (
        <ul className="w-full py-1 pb-4">
          {currentFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-2 py-2 border-b border-border"
            >
              {handleContextMenu(
                'file',
                file.id,
                file.name,
                <div className="flex items-center gap-2">
                  {file.name.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                    <ImageIcon size={16} />
                  ) : file.name.endsWith('.json') ? (
                    <FileJson size={16} />
                  ) : (
                    <FileIcon size={16} />
                  )}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold hover:underline"
                  >
                    {file.name}
                  </a>
                  <span className="text-sm text-muted-foreground ml-2">
                    {file.size >= 1024 * 1024
                      ? `(${(file.size / (1024 * 1024)).toFixed(
                          2
                        )} MB)`
                      : `(${(file.size / 1024).toFixed(2)} KB)`}
                  </span>
                </div>
              )}
            </li>
          ))}
          {currentFiles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No files in this folder.
            </p>
          )}
        </ul>
      );
    } else {
      return (
        <div className="py-3 flex flex-wrap gap-8">
          {currentFiles.map((file) => (
            <span
              key={file.id}
              className="flex flex-col gap-3 items-center cursor-pointer"
            >
              {handleContextMenu(
                'file',
                file.id,
                file.name,
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                  style={{ width: '78px', minHeight: '100px' }}
                >
                  {file.name.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                    <Image
                      width={80}
                      height={64}
                      src={file.url}
                      alt={file.name}
                      className="w-[3.5rem] h-[3.5rem] object-cover rounded"
                    />
                  ) : (
                    <svg
                      className="w-[3.5rem] h-[3.5rem]"
                      xmlns="http://www.w3.org/2000/svg"
                      width="54"
                      height="54"
                      viewBox="0 0 24 24"
                      stroke="white"
                      stroke-width="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
                        fill="white"
                      />
                      <path
                        fill="white"
                        d="M14 2v4a2 2 0 0 0 2 2h4"
                      />
                    </svg>
                  )}
                  <span
                    className="text-sm text-center whitespace-normal"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {file.name.length > 10 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-sm text-foreground/80">
                              {file.name.slice(0, 15)}...
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="border border-border text-foreground/80">
                            {file.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-foreground/80">
                        {file.name}
                      </span>
                    )}
                  </span>
                </a>
              )}
            </span>
          ))}
          {currentFiles.length === 0 && (
            <p className="text-sm text-foreground/80">
              No files in this folder.
            </p>
          )}
        </div>
      );
    }
  };

  const toggleViewMode = (mode: 'list' | 'icons') => {
    setViewMode(mode);

    if (!user) return;
    (async () => {
      try {
        let docRef;
        if (selectedFolderId) {
          docRef = doc(
            db,
            'users',
            user.uid,
            'directories',
            directoryId,
            'folders',
            selectedFolderId
          );
          setFolderViewModes((prev) => ({
            ...prev,
            [selectedFolderId]: mode,
          }));
        } else {
          docRef = doc(
            db,
            'users',
            user.uid,
            'directories',
            directoryId
          );
          setDirectoryViewMode(mode);
        }
        await updateDoc(docRef, { viewMode: mode });
      } catch (error) {
        console.error('Failed to save view mode:', error);
      }
    })();
  };

  const handleNavigateBack = () => {
    setSelectedFolderId(null);
    setViewMode(directoryViewMode);
  };

  return (
    <div
      ref={menubarRef}
      style={{ position: 'relative', height: 'calc(100% - 2rem)' }}
    >
      <Dialog
        open={isEnlargedDialogOpen}
        onOpenChange={setIsEnlargedDialogOpen}
      >
        <DialogContent
          showCloseButton={false}
          className="min-w-[90%] min-h-[80%] p-0 rounded-t-lg"
          aria-describedby="Fullscreen Folders"
        >
          <DialogHeader className="space-y-0">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <Menubar className="h-8 z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between hover:bg-muted/90">
            <div className="flex items-center relative z-50">
              {selectedFolderId && (
                <Button
                  variant="ghost"
                  autoFocus
                  onClick={handleNavigateBack}
                  className="p-0 h-5 rounded-none border-b border-transparent hover:border-inverted duration-0"
                >
                  <ArrowLeft size={14} className="mr-1" /> Back
                </Button>
              )}
            </div>

            <MenubarMenu>
              <MenubarTrigger
                size="sm"
                variant="ghost"
                className="bg-muted h-4 p-1 relative right-0"
              >
                <Ellipsis size={20} />
              </MenubarTrigger>
              <MenubarContent>
                {selectedFolderId ? (
                  <MenubarItem onClick={() => setIsDialogOpen(true)}>
                    Add File
                    <MenubarShortcut>
                      <FileIcon size={14} />
                    </MenubarShortcut>
                  </MenubarItem>
                ) : (
                  <MenubarItem
                    onClick={() => setIsFolderDialogOpen(true)}
                  >
                    Add Folder
                    <MenubarShortcut>
                      <FolderIcon size={14} />
                    </MenubarShortcut>
                  </MenubarItem>
                )}
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>View</MenubarSubTrigger>
                  <MenubarSubContent className="border border-border">
                    <MenubarRadioGroup
                      value={viewMode}
                      onValueChange={(value) =>
                        toggleViewMode(value as 'list' | 'icons')
                      }
                    >
                      <MenubarRadioItem value="list">
                        Show as list
                      </MenubarRadioItem>
                      <MenubarRadioItem value="icons">
                        Show as icons
                      </MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem
                  onClick={() => setIsEnlargedDialogOpen(false)}
                >
                  Exit Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <div className="p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading...
              </p>
            ) : selectedFolderId ? (
              renderFiles()
            ) : (
              renderFolders()
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div
        style={{ position: 'relative', height: `100%` }}
        className="rounded-t-xl"
      >
        <Menubar className="directory-item-drag-handle h-8 z-10 cursor-grab px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
          <div className="flex items-center space-x-2">
            {selectedFolderId && (
              <Button
                variant="ghost"
                autoFocus
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleNavigateBack}
                className="p-0 h-5 rounded-none border-b border-transparent hover:border-inverted duration-0"
              >
                <ArrowLeft size={14} className="mr-1" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-1 items-center">
            <MenubarMenu>
              <MenubarTrigger
                variant="ghost"
                className="bg-muted p-1 h-4"
              >
                <Ellipsis size={23} />
              </MenubarTrigger>
              <MenubarContent>
                {selectedFolderId ? (
                  <MenubarItem onClick={() => setIsDialogOpen(true)}>
                    Add File{' '}
                    <MenubarShortcut>
                      <FileIcon size={14} />
                    </MenubarShortcut>
                  </MenubarItem>
                ) : (
                  <MenubarItem
                    onClick={() => setIsFolderDialogOpen(true)}
                  >
                    Add Folder
                    <MenubarShortcut>
                      <FolderIcon size={14} />
                    </MenubarShortcut>
                  </MenubarItem>
                )}
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>View</MenubarSubTrigger>
                  <MenubarSubContent className="border border-border">
                    <MenubarRadioGroup
                      value={viewMode}
                      onValueChange={(value) =>
                        toggleViewMode(value as 'list' | 'icons')
                      }
                    >
                      <MenubarRadioItem value="list">
                        Show as list
                      </MenubarRadioItem>
                      <MenubarRadioItem value="icons">
                        Show as icons
                      </MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem
                  onClick={() => setIsEnlargedDialogOpen(true)}
                >
                  Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  variant="destructive"
                  onClick={() => setIsDeleteAssetsDialogOpen(true)}
                >
                  Remove Assets
                  <MenubarShortcut>
                    <Trash2 size={14} className="text-red-500" />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </div>
        </Menubar>
        <div className="relative h-full overflow-auto p-4 border-l border-r border-b border-border bg-card">
          {loading ? (
            <LoadingSpinner />
          ) : selectedFolderId ? (
            renderFiles()
          ) : (
            renderFolders()
          )}

          {/* Dialog for Adding Files */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload file</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mb-10">
                  Upload a file to the selected folder.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <UploadFile
                  directoryId={directoryId}
                  folderId={selectedFolderId || ''}
                  existingFileNames={existingFileNames}
                  onClose={() => setIsDialogOpen(false)}
                  refreshList={() => fetchFiles(selectedFolderId!)}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog for Adding Folders */}
          <Dialog
            open={isFolderDialogOpen}
            onOpenChange={setIsFolderDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Folder</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mb-10">
                  Create a new folder in the current directory.
                </DialogDescription>
              </DialogHeader>

              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="mt-4"
              />

              <Button
                onClick={handleAddFolder}
                className="mt-4"
                disabled={isAddFolderDisabled}
              >
                Create
              </Button>
            </DialogContent>
          </Dialog>

          {/* Dialog for Renaming */}
          <Dialog
            open={isRenameDialogOpen}
            onOpenChange={setIsRenameDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename {renamingType}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mb-10">
                  Enter a new name for the {renamingType}.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New name"
                className="mt-4"
              />
              {renameError && (
                <p className="text-red-500 text-sm mt-2 text-end">
                  {renameError}
                </p>
              )}
              <Button
                onClick={handleRename}
                className="mt-4 w-full"
                disabled={isRenameDisabled}
              >
                Rename
              </Button>
            </DialogContent>
          </Dialog>

          {/* Alert Dialog for Delete Confirmation */}
          {deletingItem && (
            <Dialog
              open={!!deletingItem}
              onOpenChange={() => setDeletingItem(null)}
            >
              <DialogContent>
                <DialogTitle>
                  Are you sure you want to delete?
                </DialogTitle>
                <DialogDescription className="mt-2">
                  This action cannot be undone. This will permanently
                  delete the {deletingItem.type}.
                </DialogDescription>
                <div className="flex justify-end">
                  <DialogFooter className="mt-4">
                    <Button
                      variant="primary"
                      onClick={() => setDeletingItem(null)}
                      className="border border-border"
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleDelete}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Delete Assets Dialog */}
          <Dialog
            open={isDeleteAssetsDialogOpen}
            onOpenChange={() => setIsDeleteAssetsDialogOpen(false)}
          >
            <DialogContent>
              <DialogTitle>Remove Assets</DialogTitle>
              <DialogDescription className="mt-2">
                Are you sure you want to remove assets? This action
                cannot be undone, and it will permanently delete all
                folders and files in this directory.
              </DialogDescription>
              <DialogFooter className="mt-4">
                <Button
                  variant="primary"
                  onClick={() => setIsDeleteAssetsDialogOpen(false)}
                  className="border border-border"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAssets}
                >
                  Remove
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

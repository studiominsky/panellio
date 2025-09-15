'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Directory } from '@/types/directory-type';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface DirectoryContextType {
  directories: Directory[];
  loading: boolean;
  fetchDirectories: () => Promise<void>;
  addDirectory: (newDirectory: Directory) => void;
  removeDirectory: (directoryId: string) => Promise<void>;
  editDirectory: (
    directoryId: string,
    newName: string,
    newDescription: string
  ) => Promise<void>;
  updateDirectoryPositions: (
    reorderedDirectories: Directory[]
  ) => Promise<void>;
  setDirectories: React.Dispatch<React.SetStateAction<Directory[]>>;
}

const DirectoryContext = createContext<
  DirectoryContextType | undefined
>(undefined);

export const DirectoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDirectories = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const directoriesRef = collection(userDocRef, 'directories');
      const q = query(directoriesRef, orderBy('position'));
      const querySnapshot = await getDocs(q);

      const dirs: Directory[] = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Directory
      );

      setDirectories(dirs);
    } catch (error) {
      console.error('Error fetching directories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load directories.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addDirectory = (newDirectory: Directory) => {
    setDirectories((prevDirectories) => [
      ...prevDirectories,
      newDirectory,
    ]);
  };

  const removeDirectory = async (directoryId: string) => {
    if (!user) return;

    try {
      await deleteDoc(
        doc(db, 'users', user.uid, 'directories', directoryId)
      );

      setDirectories((prev) =>
        prev.filter((dir) => dir.id !== directoryId)
      );

      toast({ title: 'Directory removed successfully!' });
    } catch (error) {
      console.error('Error deleting directory:', error);
      toast({
        title: 'Failed to remove directory',
        variant: 'destructive',
      });
    }
  };

  const editDirectory = async (
    directoryId: string,
    newName: string,
    newDescription: string
  ) => {
    if (!user) {
      console.error('User is undefined');
      return;
    }

    try {
      const newSlug = newName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const directoryRef = doc(
        db,
        'users',
        user.uid,
        'directories',
        directoryId
      );

      await updateDoc(directoryRef, {
        name: newName,
        slug: newSlug,
        description: newDescription,
      });

      setDirectories((prevDirectories) =>
        prevDirectories.map((dir) =>
          dir.id === directoryId
            ? {
                ...dir,
                name: newName,
                slug: newSlug,
                description: newDescription,
              }
            : dir
        )
      );

      toast({ title: 'Directory updated successfully!' });

      const newRoute = `/${user.username}/${newSlug}`;

      router.push(newRoute);
      router.refresh();
    } catch (error) {
      console.error('Error updating directory:', error);
      toast({
        title: 'Failed to update directory',
        variant: 'destructive',
      });
    }
  };

  const updateDirectoryPositions = async (
    reorderedDirectories: Directory[]
  ) => {
    if (!user) return;

    try {
      const batch = writeBatch(db);
      reorderedDirectories.forEach((dir, index) => {
        const docRef = doc(
          db,
          'users',
          user.uid,
          'directories',
          dir.id
        );
        batch.update(docRef, { position: index });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error updating directory positions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update directory positions.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchDirectories();
    } else {
      setDirectories([]);
    }
  }, [user, fetchDirectories]);

  const contextValue = useMemo(
    () => ({
      directories,
      loading,
      fetchDirectories,
      addDirectory,
      removeDirectory,
      editDirectory,
      updateDirectoryPositions,
      setDirectories,
    }),
    [
      directories,
      loading,
      fetchDirectories,
      removeDirectory,
      editDirectory,
      updateDirectoryPositions,
    ]
  );

  return (
    <DirectoryContext.Provider value={contextValue}>
      {children}
    </DirectoryContext.Provider>
  );
};

export const useDirectory = () => {
  const context = useContext(DirectoryContext);
  if (context === undefined) {
    throw new Error(
      'useDirectory must be used within a DirectoryProvider'
    );
  }
  return context;
};

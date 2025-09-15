'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Directory } from '@/types/directory-type';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface DirectoryContextType {
  directories: Directory[];
  fetchDirectories: () => Promise<void>;
  addDirectory: (newDirectory: Directory) => void;
  removeDirectory: (directoryId: string) => void;
  editDirectory: (
    directoryId: string,
    newName: string,
    newDescription: string
  ) => Promise<void>;
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

  const router = useRouter();

  const fetchDirectories = useCallback(async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const directoriesRef = collection(userDocRef, 'directories');
      const querySnapshot = await getDocs(directoriesRef);

      const dirs: Directory[] = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Directory)
      );

      setDirectories(dirs);
    } catch (error) {
      console.error('Error fetching directories:', error);
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

  useEffect(() => {
    if (user) {
      fetchDirectories();
    }
  }, [user, fetchDirectories]);

  return (
    <DirectoryContext.Provider
      value={{
        directories,
        fetchDirectories,
        addDirectory,
        removeDirectory,
        editDirectory,
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
};

export const useDirectoryContext = () => {
  const context = useContext(DirectoryContext);
  if (!context) {
    throw new Error(
      'useDirectoryContext must be used within a DirectoryProvider'
    );
  }
  return context;
};

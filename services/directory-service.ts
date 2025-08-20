import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { DirectoryItem } from '@/types/directory-type';

export const createDirectory = async (
  user: { uid: string; username?: string },
  name: string,
  description: string,
  position: number,
  grid?: string,
  items?: DirectoryItem[]
) => {
  if (!user || !user.uid || !user.username) {
    throw new Error('User not authenticated or username is missing');
  }

  const directoriesRef = collection(
    db,
    'users',
    user.uid,
    'directories'
  );

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const initialItems = items || [];

  const docRef = await addDoc(directoriesRef, {
    name,
    description,
    slug,
    username: user.username,
    createdAt: serverTimestamp(),
    items: initialItems,
    grid: grid || 'default',
    position,
  });

  return {
    id: docRef.id,
    slug,
    username: user.username,
  };
};

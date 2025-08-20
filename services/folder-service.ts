import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { User } from 'firebase/auth';

export const createFolder = async (
  user: User | null,
  directoryId: string,
  folderName: string
): Promise<void> => {
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const directoryDocRef = doc(
    db,
    'users',
    user.uid,
    'directories',
    directoryId
  );
  const foldersRef = collection(directoryDocRef, 'folders');

  await addDoc(foldersRef, {
    name: folderName,
    createdAt: serverTimestamp(),
  });
};

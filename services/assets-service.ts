// services/assets-service.ts

import { storage, db } from '@/lib/firebase';
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  writeBatch,
  getDocs,
  getDoc,
  arrayRemove,
  query,
  where,
} from 'firebase/firestore';

import { User } from 'firebase/auth';
import { plans } from '@/lib/plans';

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

export const getUserStorageUsage = async (
  userId: string
): Promise<number> => {
  const directoriesRef = collection(db, 'users', userId, 'directories');
  const directoriesSnapshot = await getDocs(directoriesRef);

  let totalSize = 0;

  for (const directoryDoc of directoriesSnapshot.docs) {
    const foldersRef = collection(directoryDoc.ref, 'folders');
    const foldersSnapshot = await getDocs(foldersRef);

    for (const folderDoc of foldersSnapshot.docs) {
      const filesRef = collection(folderDoc.ref, 'files');
      const filesSnapshot = await getDocs(filesRef);
      filesSnapshot.forEach((fileDoc) => {
        totalSize += fileDoc.data().size || 0;
      });
    }
  }

  return totalSize;
};

export const uploadFile = async (
  user: User | null,
  file: File,
  directoryId: string,
  folderId: string
): Promise<void> => {
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  const userPlan = userDoc.data()?.stripeRole || 'core'; // Corrected this line
  const planLimits = plans[userPlan as keyof typeof plans].limits;

  if (planLimits.storage === 0) {
    throw new Error(
      'Your current plan does not allow file uploads.'
    );
  }

  const currentUsage = await getUserStorageUsage(user.uid);

  if (currentUsage + file.size > planLimits.storage) {
    throw new Error('Storage limit exceeded.');
  }

  const fileRef = ref(
    storage,
    `files/${user.uid}/${directoryId}/${folderId}/${file.name}`
  );
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);

  const folderDocRef = doc(
    db,
    'users',
    user.uid,
    'directories',
    directoryId,
    'folders',
    folderId
  );
  const filesRef = collection(folderDocRef, 'files');

  await addDoc(filesRef, {
    name: file.name,
    url: downloadURL,
    size: file.size,
    createdAt: serverTimestamp(),
  });
};

export const deleteAssets = async (
  userId: string,
  directoryId: string
): Promise<void> => {
  try {
    const directoryRef = doc(
      db,
      'users',
      userId,
      'directories',
      directoryId
    );
    const foldersRef = collection(directoryRef, 'folders');

    const batch = writeBatch(db);

    const foldersSnapshot = await getDocs(foldersRef);
    if (!foldersSnapshot.empty) {
      for (const folderDoc of foldersSnapshot.docs) {
        const folderId = folderDoc.id;

        const filesRef = collection(
          directoryRef,
          'folders',
          folderId,
          'files'
        );
        const filesSnapshot = await getDocs(filesRef);

        for (const fileDoc of filesSnapshot.docs) {
          const fileData = fileDoc.data();
          if (fileData.url) {
            const fileRef = ref(storage, fileData.url);

            try {
              await deleteObject(fileRef);
            } catch (storageError) {
              console.error(
                `Error deleting file from storage (${fileData.name}):`,
                storageError
              );
            }
          }

          batch.delete(fileDoc.ref);
        }

        batch.delete(folderDoc.ref);
      }
    }

    const directorySnapshot = await getDoc(directoryRef);
    if (!directorySnapshot.exists()) {
      throw new Error('Directory does not exist.');
    }

    const directoryData = directorySnapshot.data();
    if (!directoryData?.items) {
      console.error('No items found in directory.');
      return;
    }

    const assetsItemToRemove = directoryData.items.find(
      (item: any) => item.name === 'assets'
    );

    if (!assetsItemToRemove) {
      console.error('Assets item not found in directory items.');
    } else {
      batch.update(directoryRef, {
        items: arrayRemove(assetsItemToRemove),
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error removing assets:', error);
    throw new Error('Failed to remove assets.');
  }
};
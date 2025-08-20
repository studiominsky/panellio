// services/daily-service.ts

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
  getDocs,
} from 'firebase/firestore';
import { Daily } from '@/types/daily-types';

export const addDaily = async (
  userId: string,
  directoryId: string,
  daily: Omit<Daily, 'id' | 'createdAt'>
): Promise<string> => {
  const dailyRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'daily'
  );

  const existingDocs = await getDocs(dailyRef);
  if (!existingDocs.empty) {
    throw new Error(
      'Daily already exists. Update the existing daily instead.'
    );
  }

  const dailyDocRef = doc(dailyRef);
  await setDoc(dailyDocRef, {
    ...daily,
    createdAt: Timestamp.fromDate(new Date()),
  });

  await updateDoc(dailyDocRef, { id: dailyDocRef.id });

  const directoryRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId
  );
  const directorySnap = await getDoc(directoryRef);
  const directoryData = directorySnap.data();
  if (
    !directoryData?.items?.some((item: any) => item.name === 'daily')
  ) {
    await updateDoc(directoryRef, {
      items: arrayUnion({ name: 'daily', type: 'daily' }),
    });
  }

  return dailyDocRef.id;
};

export const getDaily = async (
  userId: string,
  directoryId: string
): Promise<Daily | null> => {
  const dailyRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'daily'
  );
  const snapshot = await getDocs(dailyRef);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    id: data.id,
    date: data.date,
    dayStart: data.dayStart,
    dayEnd: data.dayEnd,
    repeatMode: data.repeatMode,
    blocks: data.blocks,
    createdAt: data.createdAt.toDate(),
  };
};

export const updateDaily = async (
  userId: string,
  directoryId: string,
  dailyId: string,
  updates: Partial<Omit<Daily, 'id' | 'createdAt'>>
): Promise<void> => {
  const dailyRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'daily',
    dailyId
  );

  await updateDoc(dailyRef, updates);
};

export const deleteDaily = async (
  userId: string,
  directoryId: string
): Promise<void> => {
  const dailyRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'daily'
  );
  const snapshot = await getDocs(dailyRef);

  if (snapshot.empty) return;

  const dailyDoc = snapshot.docs[0].ref;

  await deleteDoc(dailyDoc);

  const directoryRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId
  );
  const directorySnap = await getDoc(directoryRef);
  const directoryData = directorySnap.data();

  if (directoryData?.items) {
    const dailyItem = directoryData.items.find(
      (item: any) => item.name === 'daily'
    );
    if (dailyItem) {
      await updateDoc(directoryRef, {
        items: arrayRemove(dailyItem),
      });
    }
  }
};

export const getDailiesBatch = async (
  userId: string,
  directoryIds: string[]
) => {
  if (!directoryIds.length) return [];

  const allDailies: Daily[] = [];

  await Promise.all(
    directoryIds.map(async (directoryId) => {
      const dailyRef = collection(
        db,
        'users',
        userId,
        'directories',
        directoryId,
        'daily'
      );
      const snapshot = await getDocs(dailyRef);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        allDailies.push({
          id: docSnap.id,
          date: data.date,
          dayStart: data.dayStart,
          dayEnd: data.dayEnd,
          repeatMode: data.repeatMode,
          blocks: data.blocks,
          createdAt: data.createdAt.toDate(),
        });
      }
    })
  );

  return allDailies;
};

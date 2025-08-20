// services/dictionary-services.ts
import { db } from '@/lib/firebase';
import {
  DictionaryItem,
  CreateDictionaryItemPayload,
} from '@/types/dictionary-types';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';

export const addDictionaryItem = async (
  userId: string,
  directoryId: string,
  card: CreateDictionaryItemPayload
): Promise<string> => {
  const cardsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'dictionary'
  );
  const docRef = await addDoc(cardsRef, {
    ...card,
    createdAt: new Date(),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const getDictionaryItems = async (
  userId: string,
  directoryId: string
): Promise<DictionaryItem[]> => {
  const cardsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'dictionary'
  );
  const q = query(cardsRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    title: docSnap.data().title,
    text: docSnap.data().text || '',
    visibleText: docSnap.data().visibleText,
    hiddenText: docSnap.data().hiddenText,
    difficulty: docSnap.data().difficulty || 0,
    tags: docSnap.data().tags || [],
    color: docSnap.data().color || 'blue',
    createdAt: docSnap.data().createdAt.toDate(),
  }));
};

export const updateDictionaryItem = async (
  userId: string,
  directoryId: string,
  cardId: string,
  updates: Partial<DictionaryItem>
) => {
  const cardRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'dictionary',
    cardId
  );
  await updateDoc(cardRef, updates);
};

export const deleteDictionaryItem = async (
  userId: string,
  directoryId: string,
  cardId: string
) => {
  const cardRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'dictionary',
    cardId
  );
  await deleteDoc(cardRef);
};

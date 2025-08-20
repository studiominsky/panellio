import { db } from '@/lib/firebase';
import { CreateNotePayload, Note } from '@/types/notes-types';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  writeBatch,
  arrayRemove,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

export const addNote = async (
  userId: string,
  directoryId: string,
  note: CreateNotePayload
): Promise<string> => {
  const notesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'notes'
  );
  const docRef = await addDoc(notesRef, {
    ...note,
    createdAt: Timestamp.fromDate(new Date()),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const updateNote = async (
  userId: string,
  directoryId: string,
  noteId: string,
  updates: Partial<Note>
) => {
  const noteRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'notes',
    noteId
  );
  await updateDoc(noteRef, updates);
};

export const deleteNote = async (
  userId: string,
  directoryId: string,
  noteId: string
) => {
  const noteRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'notes',
    noteId
  );
  await deleteDoc(noteRef);
};

export const getNotes = async (
  userId: string,
  directoryId: string
): Promise<Note[]> => {
  const notesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'notes'
  );
  const q = query(notesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  const notes: Note[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title || 'Untitled Note',
      content: data.content || '',
      tags: data.tags || [],
      createdAt: data.createdAt
        ? data.createdAt.toDate()
        : new Date(),
    };
  });
  return notes;
};

export const deleteNotes = async (
  userId: string,
  directoryId: string
): Promise<void> => {
  const notesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'notes'
  );
  const batch = writeBatch(db);
  const snapshot = await getDocs(notesRef);
  snapshot.forEach((noteDoc) => {
    batch.delete(noteDoc.ref);
  });

  const directoryRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId
  );
  const directorySnapshot = await getDoc(directoryRef);
  const directoryData = directorySnapshot.data();
  if (directoryData?.items) {
    const notesItemToRemove = directoryData.items.find(
      (item: any) => item.name === 'notes'
    );
    if (notesItemToRemove) {
      batch.update(directoryRef, {
        items: arrayRemove(notesItemToRemove),
      });
    }
  }
  await batch.commit();
};

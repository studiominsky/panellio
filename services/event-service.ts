import { db } from '@/lib/firebase';
import { Event, Task } from '@/types/event-types';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  query,
  orderBy,
  limit,
  writeBatch,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';

export const addEvent = async (
  userId: string,
  directoryId: string,
  event: Omit<Event, 'id'>
): Promise<string> => {
  const eventsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'events'
  );

  const q = query(eventsRef, orderBy('position', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  let newPosition = 1;
  if (!snapshot.empty) {
    const lastEvent = snapshot.docs[0].data();
    newPosition = (lastEvent.position || 0) + 1;
  }

  const docRef = await addDoc(eventsRef, {
    ...event,
    tasks: event.tasks || [],
    position: newPosition,
    createdAt: Timestamp.fromDate(new Date()),
    startDate: event.startDate
      ? Timestamp.fromDate(event.startDate)
      : null,
    endDate: event.endDate ? Timestamp.fromDate(event.endDate) : null,
    startTime: event.startTime || null, // Store as string
    endTime: event.endTime || null, // Store as string
  });

  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const updateEvent = async (
  userId: string,
  directoryId: string,
  eventId: string,
  updates: Partial<Event>
) => {
  const eventRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'events',
    eventId
  );

  const updateData: any = { ...updates };

  if (updates.startDate) {
    updateData.startDate = Timestamp.fromDate(updates.startDate);
  }
  if (updates.endDate !== undefined) {
    updateData.endDate = updates.endDate
      ? Timestamp.fromDate(updates.endDate)
      : null;
  }
  if (updates.startTime) {
    updateData.startTime = updates.startTime;
  }
  if (updates.endTime !== undefined) {
    updateData.endTime = updates.endTime;
  }
  if (updates.tasks) {
    updateData.tasks = updates.tasks;
  }

  await updateDoc(eventRef, updateData);
};

export const deleteEvent = async (
  userId: string,
  directoryId: string,
  eventId: string
) => {
  const eventRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'events',
    eventId
  );
  await deleteDoc(eventRef);
};

export const getEvents = async (
  userId: string,
  directoryId: string
): Promise<Event[]> => {
  const eventsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'events'
  );
  const q = query(eventsRef, orderBy('position', 'asc'));
  const snapshot = await getDocs(q);

  const events: Event[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description || '',
      location: data.location || '',
      position: data.position || 0,
      createdAt: data.createdAt
        ? data.createdAt.toDate()
        : new Date(),
      priority: data.priority || 'low',
      startDate: data.startDate
        ? data.startDate.toDate()
        : new Date(),
      endDate: data.endDate ? data.endDate.toDate() : null,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      tasks: data.tasks || [],
      directoryId,
    };
  });

  return events;
};

export const deleteEvents = async (
  userId: string,
  directoryId: string
): Promise<void> => {
  const directoryRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId
  );
  const eventsRef = collection(directoryRef, 'events');

  const batch = writeBatch(db);
  const eventsSnapshot = await getDocs(eventsRef);

  eventsSnapshot.forEach((eventDoc) => {
    batch.delete(eventDoc.ref);
  });

  const directorySnapshot = await getDoc(directoryRef);
  const directoryData = directorySnapshot.data();

  if (!directoryData?.items) {
    console.error('No items found in directory');
    return;
  }

  const eventsItemToRemove = directoryData.items.find(
    (item: any) => item.name === 'events'
  );

  if (eventsItemToRemove) {
    batch.update(directoryRef, {
      items: arrayRemove(eventsItemToRemove),
    });
  }

  await batch.commit();
};

export const getEventsBatch = async (
  userId: string,
  directoryIds: string[]
): Promise<Event[]> => {
  if (!directoryIds.length) return [];

  const allEvents: Event[] = [];

  await Promise.all(
    directoryIds.map(async (directoryId) => {
      const eventsRef = collection(
        db,
        'users',
        userId,
        'directories',
        directoryId,
        'events'
      );
      const q = query(eventsRef, orderBy('position', 'asc'));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        allEvents.push({
          id: doc.id,
          title: data.title,
          description: data.description || '',
          location: data.location || '',
          position: data.position || 0,
          createdAt: data.createdAt
            ? data.createdAt.toDate()
            : new Date(),
          priority: data.priority || 'low',
          startDate: data.startDate
            ? data.startDate.toDate()
            : new Date(),
          endDate: data.endDate ? data.endDate.toDate() : null,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          tasks: data.tasks || [],
          directoryId,
        });
      });
    })
  );

  return allEvents;
};

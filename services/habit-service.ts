import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  runTransaction,
  writeBatch,
  getDoc,
  arrayRemove,
} from 'firebase/firestore';
import { Habit, HabitDay } from '@/types/habit-types';

export const addHabit = async (
  userId: string,
  directoryId: string,
  habit: Omit<Habit, 'id' | 'days' | 'createdAt'>
): Promise<string> => {
  const habitsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'habits'
  );

  const days: HabitDay[] = [];
  const { startDate, duration } = habit;
  for (let i = 0; i < duration; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push({ date, completed: false });
  }

  const newHabit = {
    ...habit,
    days,
    createdAt: Timestamp.fromDate(new Date()),
  };

  const docRef = await addDoc(habitsRef, newHabit);

  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
};

export const updateHabit = async (
  userId: string,
  directoryId: string,
  habitId: string,
  updatedFields: Partial<Omit<Habit, 'id' | 'createdAt'>>
): Promise<void> => {
  const habitRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'habits',
    habitId
  );

  try {
    await updateDoc(habitRef, updatedFields);
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

export const getHabits = async (
  userId: string,
  directoryId: string
): Promise<Habit[]> => {
  const habitsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'habits'
  );
  const q = query(habitsRef, where('createdAt', '!=', null));
  const snapshot = await getDocs(q);

  const habits: Habit[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      duration: data.duration,
      startDate: data.startDate.toDate(),
      days: data.days.map((day: any) => ({
        date: day.date.toDate(),
        completed: day.completed,
      })),
      createdAt: data.createdAt.toDate(),
      filterMode: data.filterMode || 'completed',
      directoryId,
    };
  });

  return habits;
};

export const updateHabitDay = async (
  userId: string,
  directoryId: string,
  habitId: string,
  dayIndex: number,
  completed: boolean
) => {
  const habitRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'habits',
    habitId
  );

  try {
    await runTransaction(db, async (transaction) => {
      const habitDoc = await transaction.get(habitRef);
      if (!habitDoc.exists()) {
        throw new Error('Habit does not exist');
      }

      const habitData = habitDoc.data() as Habit;

      if (dayIndex < 0 || dayIndex >= habitData.days.length) {
        throw new Error('Invalid day index');
      }

      const updatedDays = [...habitData.days];
      updatedDays[dayIndex].completed = completed;

      transaction.update(habitRef, { days: updatedDays });
    });
  } catch (error) {
    console.error('Error updating habit day:', error);
    throw error;
  }
};

export const deleteHabit = async (
  userId: string,
  directoryId: string,
  habitId: string
) => {
  const habitRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'habits',
    habitId
  );
  await deleteDoc(habitRef);
};

export const deleteHabits = async (
  userId: string,
  directoryId: string,
  habitIds: string[]
): Promise<void> => {
  const batch = writeBatch(db);
  const habitsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'habits'
  );

  habitIds.forEach((habitId) => {
    const habitDocRef = doc(habitsRef, habitId);
    batch.delete(habitDocRef);
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
    const habitsItemToRemove = directoryData.items.find(
      (item: any) => item.name === 'habits'
    );
    if (habitsItemToRemove) {
      batch.update(directoryRef, {
        items: arrayRemove(habitsItemToRemove),
      });
    }
  } else {
    console.error('No items found in directory');
  }

  await batch.commit();
};

export const getHabitsBatch = async (
  userId: string,
  directoryIds: string[]
) => {
  if (!directoryIds.length) return [];

  const allHabits: Habit[] = [];

  await Promise.all(
    directoryIds.map(async (directoryId) => {
      const habitsRef = collection(
        db,
        'users',
        userId,
        'directories',
        directoryId,
        'habits'
      );
      const snapshot = await getDocs(habitsRef);
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        allHabits.push({
          id: doc.id,
          name: data.name,
          duration: data.duration,
          startDate: data.startDate.toDate(),
          days: data.days.map((day: any) => ({
            date: day.date.toDate(),
            completed: day.completed,
          })),
          createdAt: data.createdAt.toDate(),
          filterMode: data.filterMode || 'completed',
          directoryId,
        });
      });
    })
  );

  return allHabits;
};

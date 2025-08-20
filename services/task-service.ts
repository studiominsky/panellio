import { db } from '@/lib/firebase';
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
import { Task } from '@/types/task-types';

export const addTask = async (
  userId: string,
  directoryId: string,
  task: Omit<Task, 'id' | 'position'>
): Promise<string> => {
  const tasksRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tasks'
  );

  const q = query(tasksRef, orderBy('position', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  let newPosition = 1;
  if (!snapshot.empty) {
    const lastTask = snapshot.docs[0].data();
    newPosition = lastTask.position + 1;
  }

  const docRef = await addDoc(tasksRef, {
    ...task,
    position: newPosition,
    createdAt: Timestamp.fromDate(new Date()),
  });

  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const updateTask = async (
  userId: string,
  directoryId: string,
  taskId: string,
  updates: Partial<Task>
) => {
  const taskRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tasks',
    taskId
  );
  await updateDoc(taskRef, updates);
};

export const deleteTask = async (
  userId: string,
  directoryId: string,
  taskId: string
) => {
  const taskRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tasks',
    taskId
  );
  await deleteDoc(taskRef);
};

export const getTasks = async (
  userId: string,
  directoryId: string
): Promise<Task[]> => {
  const tasksRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tasks'
  );
  const q = query(tasksRef, orderBy('position', 'asc'));
  const snapshot = await getDocs(q);

  const tasks: Task[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description || '',
      position: data.position || 0,
      completed: data.completed || false,
      createdAt: data.createdAt
        ? data.createdAt.toDate()
        : new Date(),
      priority: data.priority || 'low',
      dueDate: data.dueDate ? data.dueDate.toDate() : null,
      dueTime: data.dueTime || null, // Add dueTime
      directoryId,
    };
  });

  return tasks;
};

export const deleteTasks = async (
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
  const tasksRef = collection(directoryRef, 'tasks');

  const batch = writeBatch(db);

  const tasksSnapshot = await getDocs(tasksRef);
  tasksSnapshot.forEach((taskDoc) => {
    batch.delete(taskDoc.ref);
  });

  const directorySnapshot = await getDoc(directoryRef);
  const directoryData = directorySnapshot.data();

  if (!directoryData?.items) {
    console.error('No items found in directory');
    return;
  }

  const tasksItemToRemove = directoryData.items.find(
    (item: any) => item.name === 'tasks'
  );

  batch.update(directoryRef, {
    items: arrayRemove(tasksItemToRemove),
  });

  await batch.commit();
};

export const getTasksBatch = async (
  userId: string,
  directoryIds: string[]
): Promise<Task[]> => {
  if (!directoryIds.length) return [];

  const allTasks: Task[] = [];

  await Promise.all(
    directoryIds.map(async (directoryId) => {
      const tasksRef = collection(
        db,
        'users',
        userId,
        'directories',
        directoryId,
        'tasks'
      );
      const q = query(tasksRef, orderBy('position', 'asc'));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        allTasks.push({
          id: doc.id,
          title: data.title,
          description: data.description || '',
          position: data.position || 0,
          completed: data.completed || false,
          createdAt: data.createdAt
            ? data.createdAt.toDate()
            : new Date(),
          priority: data.priority || 'low',
          dueDate: data.dueDate ? data.dueDate.toDate() : null,
          dueTime: data.dueTime || null, // Add dueTime
          directoryId,
        });
      });
    })
  );

  return allTasks;
};

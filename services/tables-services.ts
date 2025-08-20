import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  Timestamp,
  query,
  orderBy,
  writeBatch,
  arrayRemove,
  setDoc,
} from 'firebase/firestore';
import {
  CreateTableItemPayload,
  Table,
  TableItem,
} from '@/types/tables-types';

export const addTable = async (
  userId: string,
  directoryId: string,
  table: Omit<Table, 'id' | 'createdAt'>
): Promise<string> => {
  const tablesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables'
  );
  const docRef = await addDoc(tablesRef, {
    ...table,
    createdAt: Timestamp.fromDate(new Date()),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const updateTable = async (
  userId: string,
  directoryId: string,
  tableId: string,
  updates: Partial<Table>
) => {
  const tableRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables',
    tableId
  );
  await setDoc(tableRef, updates, { merge: true });
};

export const deleteTable = async (
  userId: string,
  directoryId: string,
  tableId: string
) => {
  const tableRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables',
    tableId
  );
  await deleteDoc(tableRef);
};

export const getTables = async (
  userId: string,
  directoryId: string
): Promise<Table[]> => {
  const tablesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables'
  );
  const q = query(tablesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  const tables: Table[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || 'Untitled Table',
      description: data.description || '',
      fieldDefinitions: data.fieldDefinitions || [],
      createdAt: data.createdAt
        ? data.createdAt.toDate()
        : new Date(),
    };
  });
  return tables;
};

export const deleteTables = async (
  userId: string,
  directoryId: string
): Promise<void> => {
  const tablesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables'
  );
  const batch = writeBatch(db);
  const snapshot = await getDocs(tablesRef);
  snapshot.forEach((tableDoc) => {
    batch.delete(tableDoc.ref);
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
    const tablesItemToRemove = directoryData.items.find(
      (item: any) => item.name === 'tables'
    );
    if (tablesItemToRemove) {
      batch.update(directoryRef, {
        items: arrayRemove(tablesItemToRemove),
      });
    }
  }
  await batch.commit();
};

export const addTableItem = async (
  userId: string,
  directoryId: string,
  tableId: string,
  tableItem: CreateTableItemPayload
): Promise<string> => {
  const tableItemsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables',
    tableId,
    'items'
  );
  const docRef = await addDoc(tableItemsRef, {
    ...tableItem,
    createdAt: Timestamp.fromDate(new Date()),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const updateTableItem = async (
  userId: string,
  directoryId: string,
  tableId: string,
  tableItemId: string,
  updates: Partial<TableItem>
) => {
  const tableItemRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables',
    tableId,
    'items',
    tableItemId
  );
  await updateDoc(tableItemRef, updates);
};

export const deleteTableItem = async (
  userId: string,
  directoryId: string,
  tableId: string,
  tableItemId: string
) => {
  const tableItemRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables',
    tableId,
    'items',
    tableItemId
  );
  await deleteDoc(tableItemRef);
};

export const getTableItems = async (
  userId: string,
  directoryId: string,
  tableId: string
): Promise<TableItem[]> => {
  const tableItemsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'tables',
    tableId,
    'items'
  );
  const q = query(tableItemsRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  const items: TableItem[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      data: data.data,
      createdAt: data.createdAt
        ? data.createdAt.toDate()
        : new Date(),
    };
  });
  return items;
};

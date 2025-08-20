import { db } from '@/lib/firebase';
import { NodePanel } from '@/types/nodes-types';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

export const addNodePanel = async (
  userId: string,
  directoryId: string,
  panel: Omit<NodePanel, 'panelId'>
): Promise<string> => {
  const nodesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'nodes'
  );
  const docRef = await addDoc(nodesRef, panel);
  await updateDoc(docRef, { panelId: docRef.id });
  return docRef.id;
};

export const updateNodePanel = async (
  userId: string,
  directoryId: string,
  panelId: string,
  updates: Partial<NodePanel>
) => {
  const panelRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'nodes',
    panelId
  );
  await updateDoc(panelRef, updates);
};

export const deleteNodePanel = async (
  userId: string,
  directoryId: string,
  panelId: string
) => {
  const panelRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'nodes',
    panelId
  );
  await deleteDoc(panelRef);
};

export const getNodePanels = async (
  userId: string,
  directoryId: string
): Promise<NodePanel[]> => {
  const nodesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'nodes'
  );
  const snapshot = await getDocs(nodesRef);
  return snapshot.docs.map((doc) => ({
    panelId: doc.id,
    ...doc.data(),
  })) as NodePanel[];
};

export const deleteAllNodePanels = async (
  userId: string,
  directoryId: string
) => {
  const nodesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'nodes'
  );

  const snapshot = await getDocs(nodesRef);
  const batch = writeBatch(db);

  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

export const getNodePanelsBatch = async (
  userId: string,
  directoryIds: string[]
) => {
  if (!directoryIds.length) return [];

  const allNodePanels: NodePanel[] = [];

  await Promise.all(
    directoryIds.map(async (directoryId) => {
      const nodesRef = collection(
        db,
        'users',
        userId,
        'directories',
        directoryId,
        'nodes'
      );
      const snapshot = await getDocs(nodesRef);
      snapshot.docs.forEach((doc) => {
        allNodePanels.push({
          panelId: doc.id,
          ...doc.data(),
          name: '',
          nodes: [],
          edges: [],
          edgeType: 'default',
          directoryId,
        });
      });
    })
  );

  return allNodePanels;
};

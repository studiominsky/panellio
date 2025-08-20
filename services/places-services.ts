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
  writeBatch,
  getDoc,
  setDoc,
  arrayRemove,
  where,
} from 'firebase/firestore';
import { Place, Group } from '@/types/place-types';

export const addPlace = async (
  userId: string,
  directoryId: string,
  place: Omit<Place, 'id'>
): Promise<string> => {
  const placesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'places'
  );

  const docRef = await addDoc(placesRef, {
    ...place,
    createdAt: Timestamp.fromDate(new Date()),
  });

  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
};

export const updatePlace = async (
  userId: string,
  directoryId: string,
  placeId: string,
  updates: Partial<Place>
) => {
  const placeRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'places',
    placeId
  );
  await updateDoc(placeRef, updates);
};

export const deletePlace = async (
  userId: string,
  directoryId: string,
  placeId: string
) => {
  const placeRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'places',
    placeId
  );
  await deleteDoc(placeRef);
};

export const getPlaces = async (
  userId: string,
  directoryId: string
): Promise<Place[]> => {
  const placesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'places'
  );
  const q = query(placesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);

  const places: Place[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      groupId: data.groupId || undefined,
      directoryId: data.directoryId,
    };
  });
  return places;
};

export const deleteAllPlaces = async (
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
  const placesRef = collection(directoryRef, 'places');
  const batch = writeBatch(db);
  const snapshot = await getDocs(placesRef);

  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  const directorySnapshot = await getDoc(directoryRef);
  const directoryData = directorySnapshot.data();

  if (!directoryData?.items) {
    console.error('No items found in directory');
  } else {
    const placesItemToRemove = directoryData.items.find(
      (item: any) => item.name === 'places'
    );

    if (placesItemToRemove) {
      batch.update(directoryRef, {
        items: arrayRemove(placesItemToRemove),
      });
    }
  }

  await batch.commit();
};

export const addGroup = async (
  userId: string,
  directoryId: string,
  group: Omit<Group, 'id'>
): Promise<string> => {
  const groupsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'groups'
  );

  const docRef = await addDoc(groupsRef, {
    ...group,
    createdAt: Timestamp.fromDate(new Date()),
  });

  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
};

export const getGroups = async (
  userId: string,
  directoryId: string
): Promise<Group[]> => {
  const groupsRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'groups'
  );
  const q = query(groupsRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);

  const groups: Group[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
    };
  });
  return groups;
};

export interface MapOptions {
  showPlaces: boolean;
  showNavigation: boolean;
  showGeocoder: boolean;
}

export const getMapOptions = async (
  userId: string,
  directoryId: string
): Promise<MapOptions> => {
  const directoryRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId
  );
  const docSnap = await getDoc(directoryRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return (
      data.mapOptions || {
        showPlaces: true,
        showNavigation: false,
        showGeocoder: false,
      }
    );
  }
  return {
    showPlaces: true,
    showNavigation: false,
    showGeocoder: false,
  };
};

export const updateMapOptions = async (
  userId: string,
  directoryId: string,
  options: MapOptions
) => {
  const directoryRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId
  );
  await setDoc(
    directoryRef,
    { mapOptions: options },
    { merge: true }
  );
};

export const deleteGroup = async (
  userId: string,
  directoryId: string,
  groupId: string
): Promise<void> => {
  const placesRef = collection(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'places'
  );
  const q = query(placesRef, where('groupId', '==', groupId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();

  const groupRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'groups',
    groupId
  );
  await deleteDoc(groupRef);
};

export const updateGroup = async (
  userId: string,
  directoryId: string,
  groupId: string,
  updates: Partial<Group>
) => {
  const groupRef = doc(
    db,
    'users',
    userId,
    'directories',
    directoryId,
    'groups',
    groupId
  );
  await updateDoc(groupRef, updates);
};

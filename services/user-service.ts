import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

interface UserProfileUpdate {
  name?: string;
  details?: string;
  location?: string;
  model?: string;
  email?: string;
  theme?: string;
}

export const getUserByUsername = async (
  username: string
): Promise<boolean> => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(
      usersCollection,
      where('username', '==', username)
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return false;
  }
};

export async function updateProfile(
  userId: string,
  profileData: UserProfileUpdate
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...profileData,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile.');
  }
}

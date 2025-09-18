import {
  auth,
  googleProvider,
  githubProvider,
  db,
} from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const generateUsername = async (name: string): Promise<string> => {
  const baseUsername = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  let uniqueUsername = baseUsername;
  let counter = 1;

  const usernamesCollection = collection(db, 'users');
  const usernameQuery = query(
    usernamesCollection,
    where('username', '==', uniqueUsername)
  );

  let existingUsernames = await getDocs(usernameQuery);

  while (!existingUsernames.empty) {
    uniqueUsername = `${baseUsername}${counter}`;
    counter++;
    const newQuery = query(
      usernamesCollection,
      where('username', '==', uniqueUsername)
    );
    existingUsernames = await getDocs(newQuery);
  }

  return uniqueUsername;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  username: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const currentUser = userCredential.user;

  await updateProfile(currentUser, { displayName });

  const userDocRef = doc(db, 'users', currentUser.uid);
  await setDoc(userDocRef, {
    name: displayName,
    username,
    email,
    createdAt: serverTimestamp(),
    theme: 'system',
    colorTheme: 'green',
    timeFormat: '24h',
    location: '',
    stripeRole: 'core',
  });

  return currentUser;
};

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const signInWithGoogle = async (
  refreshUser: () => Promise<void>
): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const username = await generateUsername(
      user.displayName || 'user'
    );

    await setDoc(userDocRef, {
      name: user.displayName,
      username,
      email: user.email,
      createdAt: serverTimestamp(),
      theme: getSystemTheme(),
      colorTheme: 'green',
      timeFormat: '24h',
      location: '',
      stripeRole: 'core',
    });
  }

  await refreshUser();
  return user;
};

export const signInWithGitHub = async (
  refreshUser: () => Promise<void>
): Promise<User> => {
  const result = await signInWithPopup(auth, githubProvider);
  const user = result.user;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const username = await generateUsername(
      user.displayName || 'user'
    );

    await setDoc(userDocRef, {
      name: user.displayName,
      username,
      email: user.email,
      createdAt: serverTimestamp(),
      theme: getSystemTheme(),
      colorTheme: 'green',
      timeFormat: '24h',
      location: '',
      stripeRole: 'core',
    });
  }

  await refreshUser();
  return user;
};

export const logout = async (router: any): Promise<void> => {
  await signOut(auth);
  router.push('/');
};
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  signUpWithEmail,
  loginWithEmail,
  signInWithGoogle,
  signInWithGitHub,
  logout as logoutService,
} from '@/services/auth-service';
import { ExtendedUser } from '@/types/user-types';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface AuthContextType {
  user: ExtendedUser | null;
  setUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>;
  signUpWithEmail: (
    email: string,
    username: string,
    password: string,
    displayName: string
  ) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithGitHub: () => Promise<User>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  updateTheme: (theme: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const fetchUserFromFirestore = async (
    uid: string
  ): Promise<Partial<ExtendedUser>> => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        username: userData.username || '',
        theme: userData.theme || 'system',
        displayName: userData.displayName || '',
        colorTheme: userData.colorTheme || '',
        timeFormat: userData.timeFormat || '24h',
        location: userData.location || '',
        stripeRole: userData.stripeRole || 'core',
        stripeCustomerId: userData.stripeCustomerId,
        stripeSubscriptionId: userData.stripeSubscriptionId,
        stripePriceId: userData.stripePriceId,
        stripeCurrentPeriodEnd: userData.stripeCurrentPeriodEnd?.toDate(),
      };
    }

    return {
      username: '',
      theme: 'system',
      displayName: '',
      colorTheme: '',
      timeFormat: '24h',
      location: '',
      stripeRole: 'core',
    };
  };

  const updateTheme = async (theme: string) => {
    if (!user || !user.uid) {
      throw new Error('User not logged in');
    }

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { theme });

    setUser((prevUser) =>
      prevUser ? { ...prevUser, theme } : prevUser
    );
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;

    const firestoreData = await fetchUserFromFirestore(
      auth.currentUser.uid
    );
    setUser({
      ...(auth.currentUser as ExtendedUser),
      ...firestoreData,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          const firestoreData = await fetchUserFromFirestore(
            currentUser.uid
          );
          const updatedUser = {
            ...(currentUser as ExtendedUser),
            ...firestoreData,
          };
          setUser(updatedUser);
          setTheme(updatedUser.theme || 'system');
        } else {
          setUser(null);
          setTheme('system');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setTheme]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        signUpWithEmail,
        loginWithEmail,
        signInWithGoogle: () => signInWithGoogle(refreshUser),
        signInWithGitHub: () => signInWithGitHub(refreshUser),
        refreshUser,
        logout: () => logoutService(router),
        updateTheme,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
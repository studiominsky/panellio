'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { auth, db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore'; // Import onSnapshot
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
import { useToast } from '@/hooks/use-toast';

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
  const { setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const previousUserRef = useRef<ExtendedUser | null>(null);

  useEffect(() => {
    const previousRole = previousUserRef.current?.stripeRole;
    const currentRole = user?.stripeRole;

    if (
      previousRole === 'core' &&
      (currentRole === 'pro' || currentRole === 'premium')
    ) {
      toast({
        title: `Welcome to ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}!`,
        description: `You've successfully upgraded. All ${currentRole} features are now unlocked.`,
      });
    }

    previousUserRef.current = user;
  }, [user, toast]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const unsubscribeFirestore = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const userData = docSnap.data();
                const updatedUser: ExtendedUser = {
                  ...currentUser,
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
                  stripeCurrentPeriodEnd:
                    userData.stripeCurrentPeriodEnd?.toDate(),
                };
                setUser(updatedUser);
                setTheme(updatedUser.theme || 'system');
              } else {
                setUser(currentUser as ExtendedUser);
              }
              setLoading(false);
            }
          );

          return () => unsubscribeFirestore();
        } else {
          setUser(null);
          setTheme('system');
          setLoading(false);
        }
      }
    );

    return () => unsubscribeAuth();
  }, [setTheme]);

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
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUser({
        ...(auth.currentUser as ExtendedUser),
        ...userData,
      });
    }
  };

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

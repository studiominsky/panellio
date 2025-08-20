import { useEffect } from 'react';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';

const colorThemeAtom = atomWithStorage<string>(
  'color-theme',
  'green'
);

export function useColorTheme() {
  const [colorTheme, setColorTheme] = useAtom(colorThemeAtom);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAndSyncColorTheme = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const fetchedColorTheme = userData.colorTheme || 'green';

            if (fetchedColorTheme !== colorTheme) {
              setColorTheme(fetchedColorTheme);
            }
          }
        } catch (error) {
          console.error(
            'Failed to fetch color theme from Firestore:',
            error
          );
        }
      }
    };

    fetchAndSyncColorTheme();
  }, [user, setColorTheme, colorTheme]);

  const updateColorTheme = async (newColorTheme: string) => {
    setColorTheme(newColorTheme);
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { colorTheme: newColorTheme });
      } catch (error) {
        console.error(
          'Failed to update color theme in Firestore:',
          error
        );
      }
    }
  };

  return [colorTheme, updateColorTheme] as const;
}

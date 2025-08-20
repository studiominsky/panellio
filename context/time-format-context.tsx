'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '@/context/auth-context';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export type TimeFormat = '24h' | '12h';

interface TimeFormatContextType {
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
}

const TimeFormatContext = createContext<
  TimeFormatContextType | undefined
>(undefined);

// TimeFormatProvider.tsx
export const TimeFormatProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, setUser } = useAuth();
  const [timeFormat, setTimeFormatState] =
    useState<TimeFormat>('24h');

  useEffect(() => {
    const fetchTimeFormat = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTimeFormatState(userData.timeFormat || '24h');
        }
      }
    };

    fetchTimeFormat();
  }, [user]);

  const setTimeFormat = async (format: TimeFormat) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { timeFormat: format });
      setTimeFormatState(format);
      setUser((prev) =>
        prev ? { ...prev, timeFormat: format } : prev
      );
      toast({
        title: 'Success',
        description: 'Time format updated successfully.',
      });
    } catch (error) {
      console.error('Error updating time format:', error);
      toast({
        title: 'Error',
        description: 'Failed to update time format.',
        variant: 'destructive',
      });
    }
  };

  return (
    <TimeFormatContext.Provider value={{ timeFormat, setTimeFormat }}>
      {children}
    </TimeFormatContext.Provider>
  );
};

export const useTimeFormat = () => {
  const context = useContext(TimeFormatContext);
  if (!context) {
    throw new Error(
      'useTimeFormat must be used within a TimeFormatProvider'
    );
  }
  return context;
};

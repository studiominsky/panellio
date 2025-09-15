'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from '@/context/auth-context';
import { useDirectory } from '@/context/dir-context';
import { getTasksBatch } from '@/services/task-service';
import { getEventsBatch } from '@/services/event-service';
import { getHabitsBatch } from '@/services/habit-service';
import { getDailiesBatch } from '@/services/daily-service';
import { getNodePanelsBatch } from '@/services/nodes-service';
import { Task } from '@/types/task-types';
import { Event } from '@/types/event-types';
import { Habit } from '@/types/habit-types';
import { Daily } from '@/types/daily-types';
import { NodePanel } from '@/types/nodes-types';
import { Directory } from '@/types/directory-type';

interface DataContextType {
  tasks: Task[];
  events: Event[];
  habits: Habit[];
  dailies: Daily[];
  nodePanels: NodePanel[];
  directories: Directory[];
  loading: boolean;
  fetchAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const DataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();
  const { directories } = useDirectory();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [nodePanels, setNodePanels] = useState<NodePanel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!user || directories.length === 0) return;

    setLoading(true);
    try {
      const directoryIds = directories.map(
        (dir: Directory) => dir.id
      );

      const [
        allTasks,
        allEvents,
        allHabits,
        allDailies,
        allNodePanels,
      ] = await Promise.all([
        getTasksBatch(user.uid, directoryIds),
        getEventsBatch(user.uid, directoryIds),
        getHabitsBatch(user.uid, directoryIds),
        getDailiesBatch(user.uid, directoryIds),
        getNodePanelsBatch(user.uid, directoryIds),
      ]);

      setTasks(allTasks);
      setEvents(allEvents);
      setHabits(allHabits);
      setDailies(allDailies);
      setNodePanels(allNodePanels);
    } catch (error) {
      console.error('Error fetching all data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, directories]);

  useEffect(() => {
    if (user && directories.length > 0) {
      fetchAllData();
    }
  }, [user, directories, fetchAllData]);

  const contextValue = useMemo(
    () => ({
      tasks,
      events,
      habits,
      dailies,
      nodePanels,
      directories,
      loading,
      fetchAllData,
    }),
    [
      tasks,
      events,
      habits,
      dailies,
      nodePanels,
      directories,
      loading,
      fetchAllData,
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

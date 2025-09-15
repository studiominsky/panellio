'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { useAuth } from '@/context/auth-context';
import { useDirectoryContext } from '@/context/dir-context';
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

interface DataContextType {
  tasks: Task[];
  events: Event[];
  habits: Habit[];
  dailies: Daily[];
  nodePanels: NodePanel[];
  directories: { id: string; name: string }[];
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
  const { directories, fetchDirectories } = useDirectoryContext();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [nodePanels, setNodePanels] = useState<NodePanel[]>([]);
  const [loading, setLoading] = useState(false);
  const [directoriesLoaded, setDirectoriesLoaded] = useState(false);

  useEffect(() => {
    if (user && directories.length === 0) {
      fetchDirectories().then(() => setDirectoriesLoaded(true));
    } else {
      setDirectoriesLoaded(true);
    }
  }, [user, directories.length]);

  const fetchAllData = async () => {
    if (!user || directories.length === 0 || !directoriesLoaded)
      return;

    setLoading(true);
    try {
      const directoryIds = directories.map((dir) => dir.id);

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
  };

  useEffect(() => {
    if (user && directories.length && directoriesLoaded) {
      fetchAllData();
    }
  }, [user, directories.length, directoriesLoaded]);

  useEffect(() => {}, [
    tasks,
    events,
    habits,
    dailies,
    nodePanels,
    directories,
  ]);

  return (
    <DataContext.Provider
      value={{
        tasks,
        events,
        habits,
        dailies,
        nodePanels,
        directories: directories.map(({ id, name, items }) => ({
          id,
          name,
          items,
        })),
        loading,
        fetchAllData,
      }}
    >
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

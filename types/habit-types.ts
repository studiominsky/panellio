export interface HabitDay {
  date: Date;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  duration: number;
  startDate: Date;
  days: HabitDay[];
  filterMode?: 'completed' | 'remaining';
  createdAt: Date;
  directoryId: string;
}

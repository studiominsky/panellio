export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  position: number;
  tasks?: Task[];
  directoryId: string;
}

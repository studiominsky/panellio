export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  position: number;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date | null;
  dueTime?: string | null;
  directoryId: string;
}

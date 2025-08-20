// components/features/tasks/task-list.tsx

import React from 'react';
import { Task } from '@/types/task-types';
import TaskItem from './task-item';
import SortableItem from '@/components/sortable-item';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TaskListProps {
  tasks: Task[];
  onToggleCompletion: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  isInFullScreen?: boolean;
  loading?: boolean;
}

export default function TaskList({
  tasks,
  onToggleCompletion,
  onDeleteTask,
  onEditTask,
  isInFullScreen,
  loading = false,
}: TaskListProps) {
  if (loading) {
    return (
      <div
        style={{ height: `calc(100% - 2rem)` }}
        className="overflow-auto p-4 h-full border-l border-r border-b border-border bg-card"
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        style={{ height: `calc(100% - 2rem)` }}
        className={`overflow-auto p-4 h-full  bg-card ${
          isInFullScreen
            ? ''
            : 'border-l border-r border-b border-border'
        }`}
      >
        <div className="py-1 pt-4 flex flex-wrap gap-8">
          <p className="text-sm text-muted-foreground">
            No tasks added yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height: `calc(100% - 2rem)` }}
      className={`p-4 bg-card overflow-auto ${
        isInFullScreen
          ? ''
          : `-auto border-b border-l border-r border-border`
      }`}
    >
      <ul className="py-1 pb-4">
        {tasks.map((task) => (
          <SortableItem key={task.id} item={task}>
            <TaskItem
              task={task}
              onToggleCompletion={onToggleCompletion}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          </SortableItem>
        ))}
      </ul>
    </div>
  );
}

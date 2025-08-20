import React from 'react';
import { Task } from '@/types/task-types';
import {
  CheckCircle,
  Circle,
  Trash2,
  Edit,
  Ellipsis,
  Grip,
} from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarShortcut,
  MenubarSeparator,
} from '../../ui/menubar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDraggable } from '@dnd-kit/core';
import { useTimeFormat } from '@/context/time-format-context';

interface TaskItemProps {
  task: Task;
  onToggleCompletion: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export default function TaskItem({
  task,
  onToggleCompletion,
  onDeleteTask,
  onEditTask,
}: TaskItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({
      id: task.id,
    });
  const { timeFormat } = useTimeFormat();

  const formatDueTime = (time: string): string => {
    if (!time) return '';
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (timeFormat === '12h') {
      const period = hour >= 12 ? 'PM' : 'AM';
      const adjustedHour = hour % 12 || 12;
      return `${adjustedHour}:${minuteStr} ${period}`;
    }
    return time;
  };

  return (
    <TooltipProvider>
      <div
        className={`relative flex items-center justify-between p-2 px-0 hover:bg-background/10 border-b border-border ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
        ref={setNodeRef}
      >
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="mr-2 focus:outline-none cursor-grab"
                aria-label="Press and hold to move"
                {...listeners}
                {...attributes}
              >
                <Grip size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              Press and hold to move
            </TooltipContent>
          </Tooltip>

          <button
            onClick={() =>
              onToggleCompletion(task.id, !task.completed)
            }
            className="mr-2 focus:outline-none"
            aria-label={
              task.completed
                ? 'Mark as incomplete'
                : 'Mark as complete'
            }
          >
            {task.completed ? (
              <CheckCircle
                size={18}
                className="text-[--ui-primary]"
              />
            ) : (
              <Circle size={18} className="text-[--ui-primary]" />
            )}
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`text-sm text-start text-foreground/80 flex-1 ${
                  task.completed
                    ? 'line-through text-muted-foreground'
                    : ''
                }`}
              >
                {task.title}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              {task.description}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center">
          <div className="mr-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="mr-1 focus:outline-none cursor-auto"
                  aria-label="Due date and time"
                  {...listeners}
                  {...attributes}
                >
                  {(task.dueDate || task.dueTime) && (
                    <span className="text-sm text-muted-foreground">
                      {task.dueDate &&
                        new Date(task.dueDate).toLocaleDateString(
                          'de-DE'
                        )}
                      {task.dueTime &&
                        ` ${formatDueTime(task.dueTime)}`}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <div>
                  Due{' '}
                  {task.dueDate &&
                    `on ${new Date(task.dueDate).toLocaleDateString(
                      'de-DE'
                    )}`}
                  {task.dueTime &&
                    ` at ${formatDueTime(task.dueTime)}`}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="mr-2 focus:outline-none cursor-auto"
                aria-label="Priority"
                {...listeners}
                {...attributes}
              >
                {task.priority === 'low' ? (
                  <span className="block rounded-full w-2 h-2 bg-[--green-700]" />
                ) : task.priority === 'medium' ? (
                  <span className="block rounded-full w-2 h-2 bg-[--blue-700]" />
                ) : (
                  <span className="block rounded-full w-2 h-2 bg-[--red-700]" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              <div>Task priority is {task.priority}</div>
            </TooltipContent>
          </Tooltip>
          <Menubar className="border-none">
            <MenubarMenu>
              <MenubarTrigger variant="ghost" size="icon">
                <Ellipsis size={16} />
              </MenubarTrigger>
              <MenubarContent align="end" className="w-32">
                <MenubarItem onSelect={() => onEditTask(task)}>
                  Edit
                  <MenubarShortcut>
                    <Edit size={14} />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  variant="destructive"
                  onSelect={() => onDeleteTask(task.id)}
                >
                  Delete
                  <MenubarShortcut>
                    <Trash2 className="text-[--red-500]" size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </TooltipProvider>
  );
}

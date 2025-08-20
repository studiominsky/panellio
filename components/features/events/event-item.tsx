import React from 'react';
import { Event, Task } from '@/types/event-types';
import {
  Trash2,
  Edit,
  Ellipsis,
  Grip,
  MapPin,
  CheckCircle,
  Circle,
} from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarShortcut,
  MenubarSeparator,
} from '@/components/ui/menubar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDraggable } from '@dnd-kit/core';
import { useTimeFormat } from '@/context/time-format-context';

interface EventItemProps {
  event: Event;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleTaskCompletion: (
    taskId: string,
    completed: boolean
  ) => void;
}

export default function EventItem({
  event,
  onEditEvent,
  onDeleteEvent,
  onToggleTaskCompletion,
}: EventItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({
      id: event.id,
    });
  const { timeFormat } = useTimeFormat();

  const formatTime = (time: string | null): string => {
    if (!time) return '';
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
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
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between">
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-font-bold text-start text-foreground/90 flex-1">
                    {event.title}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  {event.description}
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex items-center gap-2">
                {(event.startDate ||
                  event.startTime ||
                  event.endDate ||
                  event.endTime) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-auto">
                        {event.startDate &&
                          new Date(
                            event.startDate
                          ).toLocaleDateString('de-DE')}
                        {event.startTime &&
                          ` ${formatTime(event.startTime)}`}
                        {(event.endDate || event.endTime) && ' - '}
                        {event.endDate &&
                          new Date(event.endDate).toLocaleDateString(
                            'de-DE'
                          )}
                        {event.endTime &&
                          ` ${formatTime(event.endTime)}`}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      Start:{' '}
                      {event.startDate &&
                        new Date(event.startDate).toLocaleDateString(
                          'de-DE'
                        )}
                      {event.startTime &&
                        ` at ${formatTime(event.startTime)}`}
                      {(event.endDate || event.endTime) && (
                        <div>
                          End:{' '}
                          {event.endDate &&
                            new Date(
                              event.endDate
                            ).toLocaleDateString('de-DE')}
                          {event.endTime &&
                            ` at ${formatTime(event.endTime)}`}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-auto">
                      {event.priority === 'low' ? (
                        <span className="block rounded-full w-2 h-2 bg-[--green-700]" />
                      ) : event.priority === 'medium' ? (
                        <span className="block rounded-full w-2 h-2 bg-[--blue-700]" />
                      ) : (
                        <span className="block rounded-full w-2 h-2 bg-[--red-700]" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Event priority is {event.priority}
                  </TooltipContent>
                </Tooltip>
              </div>

              <Menubar className="border-none">
                <MenubarMenu>
                  <MenubarTrigger variant="ghost" size="icon">
                    <Ellipsis size={16} />
                  </MenubarTrigger>
                  <MenubarContent align="end" className="w-32">
                    <MenubarItem onSelect={() => onEditEvent(event)}>
                      Edit
                      <MenubarShortcut>
                        <Edit size={14} />
                      </MenubarShortcut>
                    </MenubarItem>

                    <MenubarSeparator />

                    <MenubarItem
                      variant="destructive"
                      onSelect={() => onDeleteEvent(event.id)}
                    >
                      Delete
                      <MenubarShortcut>
                        <Trash2
                          className="text-[--red-500]"
                          size={14}
                        />
                      </MenubarShortcut>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>
          </div>

          <span className="text-sm text-foreground/40 text-start">
            {event.description}
          </span>

          {event.tasks && event.tasks.length > 0 && (
            <ul className="mt-2 flex flex-col gap-2 pb-4">
              {event.tasks.map((task: Task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 text-sm text-foreground/80"
                >
                  <button
                    onClick={() =>
                      onToggleTaskCompletion(task.id, !task.completed)
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
                      <Circle
                        size={18}
                        className="text-[--ui-primary]"
                      />
                    )}
                  </button>
                  <span
                    className={task.completed ? 'line-through' : ''}
                  >
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {event.location && (
            <span className="pb-2 flex items-center text-sm text-foreground/90">
              <MapPin size={16} className="mr-1" />
              <span className="block mt-2">{event.location}</span>
            </span>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

import React from 'react';
import { Event } from '@/types/event-types';
import EventItem from './event-item';
import SortableItem from '@/components/sortable-item';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EventListProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleTaskCompletion: (
    eventId: string,
    taskId: string,
    completed: boolean
  ) => void;
  isInFullScreen: boolean;
  loading?: boolean;
}

export default function EventList({
  events,
  onEditEvent,
  onDeleteEvent,
  onToggleTaskCompletion,
  isInFullScreen,
  loading = false,
}: EventListProps) {
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

  if (events.length === 0) {
    return (
      <div
        style={{ height: `calc(100% - 2rem)` }}
        className={`overflow-auto p-4 h-full bg-card ${
          isInFullScreen
            ? 'border-none'
            : 'border-l border-r border-b border-border'
        }`}
      >
        <div className="py-1 pt-4 flex flex-wrap gap-8">
          <p className="text-sm text-muted-foreground">
            No events added yet.
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
          ? 'rounded-t-2xl'
          : `border-b border-l border-r border-border`
      }`}
    >
      <ul className="py-1 pb-4">
        {events.map((event) => (
          <SortableItem key={event.id} item={event}>
            <EventItem
              event={event}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
              onToggleTaskCompletion={(taskId, completed) =>
                onToggleTaskCompletion(event.id, taskId, completed)
              }
            />
          </SortableItem>
        ))}
      </ul>
    </div>
  );
}

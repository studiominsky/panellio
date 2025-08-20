'use client';

import React, { useEffect, useState } from 'react';
import { Event, Task } from '@/types/event-types';
import EventList from './event-list';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  deleteEvents,
} from '@/services/event-service';
import { toast } from '@/hooks/use-toast';
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
  CheckCircle,
  Circle,
  Ellipsis,
  Maximize2,
  Loader,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ColorThemeProvider } from '@/providers/color-theme-provider';
import CreateEventForm from './create-event-form';
import { DirectoryItem } from '@/types/directory-type';
import { useTimeFormat } from '@/context/time-format-context';

interface EventsFeatureProps {
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
  width?: number;
}

export default function EventsFeature({
  directoryId,
  onDirectoryItemRemoved,
  itemData,
  width,
}: EventsFeatureProps) {
  const { user } = useAuth();
  const { timeFormat } = useTimeFormat();
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] =
    useState(false);
  const [deletingEventId, setDeletingEventId] = useState<
    string | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeleteEventsDialogOpen, setIsDeleteEventsDialogOpen] =
    useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(
    null
  );
  const [startHour, setStartHour] = useState<number>(9);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState<number>(10);
  const [endMinute, setEndMinute] = useState<number>(0);
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');
  const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] =
    useState(false);
  const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] =
    useState(false);
  const [isEditingEventLoading, setIsEditingEventLoading] =
    useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const fetchedEvents = await getEvents(user.uid, directoryId);
        setEvents(fetchedEvents);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load events.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchEvents();
  }, [user, directoryId]);

  const handleCreateEvent = async (newEvent: Event) => {
    if (!user) return;
    try {
      const eventId = await addEvent(user.uid, directoryId, newEvent);
      setEvents((prev) => [
        ...prev,
        { ...newEvent, id: eventId, position: prev.length + 1 },
      ]);
      toast({
        title: 'Success',
        description: 'Event added successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add event.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleTaskCompletion = async (
    eventId: string,
    taskId: string,
    completed: boolean
  ) => {
    if (!user) return;

    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === eventId) {
          const updatedTasks = event.tasks?.map((task) =>
            task.id === taskId ? { ...task, completed } : task
          );
          updateEvent(user.uid, directoryId, eventId, {
            tasks: updatedTasks,
          });
          return { ...event, tasks: updatedTasks };
        }
        return event;
      })
    );
  };

  const handleDeleteEvent = async () => {
    if (!user || !deletingEventId) return;
    setLoading(true);
    try {
      await deleteEvent(user.uid, directoryId, deletingEventId);
      setEvents((prev) =>
        prev.filter((ev) => ev.id !== deletingEventId)
      );
      toast({
        title: 'Success',
        description: 'Event deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingEventId(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete event.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = async () => {
    if (!user || !editingEvent) return;
    setIsEditingEventLoading(true);

    const startTime = formatTime(
      startHour,
      startMinute,
      startPeriod,
      timeFormat
    );
    const endTime = formatTime(
      endHour,
      endMinute,
      endPeriod,
      timeFormat
    );

    const updatedEvent = { ...editingEvent, startTime, endTime };

    try {
      await updateEvent(
        user.uid,
        directoryId,
        editingEvent.id,
        updatedEvent
      );
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id ? { ...ev, ...updatedEvent } : ev
        )
      );
      toast({
        title: 'Success',
        description: 'Event updated successfully.',
      });
      setIsEditEventDialogOpen(false);
      setEditingEvent(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update event.',
        variant: 'destructive',
      });
    } finally {
      setIsEditingEventLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = events.findIndex((ev) => ev.id === active.id);
    const newIndex = events.findIndex((ev) => ev.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newEventsOrder = arrayMove(events, oldIndex, newIndex);
    setEvents(newEventsOrder);

    try {
      const updatedEvents = newEventsOrder.map((ev, index) => ({
        ...ev,
        position: index + 1,
      }));
      await Promise.all(
        updatedEvents.map((ev) =>
          updateEvent(user!.uid, directoryId, ev.id, {
            position: ev.position,
          })
        )
      );
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update event order.',
        variant: 'destructive',
      });
    }
  };

  const handleEditEventOpen = (ev: Event) => {
    const [startHourStr, startMinuteStr] = ev.startTime
      ? ev.startTime.split(':')
      : ['09', '00'];
    const [endHourStr, endMinuteStr] = ev.endTime
      ? ev.endTime.split(':')
      : ['10', '00'];
    let startHourNum = parseInt(startHourStr, 10);
    let endHourNum = parseInt(endHourStr, 10);
    let startPeriod: 'AM' | 'PM' = 'AM';
    let endPeriod: 'AM' | 'PM' = 'AM';

    if (timeFormat === '12h') {
      startPeriod = startHourNum >= 12 ? 'PM' : 'AM';
      startHourNum = startHourNum % 12 || 12;
      endPeriod = endHourNum >= 12 ? 'PM' : 'AM';
      endHourNum = endHourNum % 12 || 12;
    }

    setEditingEvent({
      ...ev,
      startDate: ev.startDate ? new Date(ev.startDate) : new Date(),
      endDate: ev.endDate ? new Date(ev.endDate) : null,
      tasks: ev.tasks || [],
    });
    setStartHour(startHourNum);
    setStartMinute(parseInt(startMinuteStr, 10));
    setStartPeriod(startPeriod);
    setEndHour(endHourNum);
    setEndMinute(parseInt(endMinuteStr, 10));
    setEndPeriod(endPeriod);
    setIsEditEventDialogOpen(true);
  };

  const handleDeleteEvents = async () => {
    if (!user) return;
    try {
      await deleteEvents(user.uid, directoryId);
      toast({ title: 'Events removed successfully!' });
      setIsDeleteEventsDialogOpen(false);
      onDirectoryItemRemoved(itemData.id);
    } catch (error) {
      console.error('Error removing events:', error);
      toast({
        title: 'Failed to remove events',
        variant: 'destructive',
      });
    }
  };

  const generateHours = () =>
    timeFormat === '12h'
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 24 }, (_, i) => i);

  const generateMinutes = () =>
    Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (
    hour: number,
    minute: number,
    period: 'AM' | 'PM',
    format: '12h' | '24h'
  ): string => {
    let adjustedHour = hour;
    if (format === '12h') {
      if (period === 'PM' && hour !== 12) adjustedHour += 12;
      else if (period === 'AM' && hour === 12) adjustedHour = 0;
    }
    return `${adjustedHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Menubar className="directory-item-drag-handle cursor-grab py-4 relative z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ghost"
            className="bg-muted h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsEventDialogOpen(true)}>
              Add Event
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => setIsFullscreen(true)}>
              Fullscreen
              <MenubarShortcut>
                <Maximize2 size={14} />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              variant="destructive"
              onClick={() => setIsDeleteEventsDialogOpen(true)}
            >
              Remove Events
              <MenubarShortcut>
                <Trash2 className="text-[--red-500]" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={events.map((ev) => ev.id)}
          strategy={rectSortingStrategy}
        >
          <EventList
            events={events}
            onEditEvent={handleEditEventOpen}
            onDeleteEvent={(id) => {
              setDeletingEventId(id);
              setIsDeleteDialogOpen(true);
            }}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            loading={loading}
            isInFullScreen={false}
          />
        </SortableContext>
      </DndContext>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="min-w-[90%] min-h-[80%] p-0 rounded-t-2xl"
        >
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <Menubar className="cursor-grab h-8 z-10 px-6 rounded-t-2xl top-0 bg-muted flex justify-between">
            <MenubarMenu>
              <MenubarTrigger
                variant="ghost"
                className="bg-muted h-4 p-1 absolute right-6"
              >
                <Ellipsis size={23} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => setIsEventDialogOpen(true)}
                >
                  Add Event
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setIsFullscreen(false)}>
                  Exit Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={events.map((ev) => ev.id)}
              strategy={rectSortingStrategy}
            >
              <ColorThemeProvider>
                <EventList
                  events={events}
                  onEditEvent={handleEditEventOpen}
                  onDeleteEvent={(id) => {
                    setDeletingEventId(id);
                    setIsDeleteDialogOpen(true);
                  }}
                  onToggleTaskCompletion={handleToggleTaskCompletion}
                  loading={loading}
                  isInFullScreen={true}
                />
              </ColorThemeProvider>
            </SortableContext>
          </DndContext>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditEventDialogOpen}
        onOpenChange={() => setIsEditEventDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Edit the details of the event.
            </DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <div className="mt-4">
              <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
                Edit Title
              </Label>
              <Input
                placeholder="Event Title"
                value={editingEvent.title}
                onChange={(e) =>
                  setEditingEvent((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
              />
              <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
                Edit Description
              </Label>
              <Textarea
                placeholder="Event Description"
                value={editingEvent.description || ''}
                onChange={(e) =>
                  setEditingEvent((prev) =>
                    prev
                      ? { ...prev, description: e.target.value }
                      : null
                  )
                }
              />

              <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
                Tasks
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="New Task"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (newTaskTitle.trim()) {
                      setEditingEvent((prev) =>
                        prev
                          ? {
                              ...prev,
                              tasks: [
                                ...(prev.tasks || []),
                                {
                                  id: Date.now().toString(),
                                  title: newTaskTitle,
                                  completed: false,
                                },
                              ],
                            }
                          : null
                      );
                      setNewTaskTitle('');
                    }
                  }}
                >
                  <PlusCircle size={16} />
                </Button>
              </div>
              <ColorThemeProvider>
                <ul className="flex flex-col gap-1 mt-4 ml-1">
                  {(editingEvent.tasks || []).map((task) => (
                    <li
                      key={task.id}
                      className="flex justify-between items-center mb-1"
                    >
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() =>
                            setEditingEvent((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    tasks: (prev.tasks || []).map(
                                      (t) =>
                                        t.id === task.id
                                          ? {
                                              ...t,
                                              completed: !t.completed,
                                            }
                                          : t
                                    ),
                                  }
                                : null
                            )
                          }
                          aria-label="Toggle completion"
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
                          className={`text-sm ${
                            task.completed
                              ? 'line-through text-muted-foreground'
                              : ''
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setEditingEvent((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  tasks: (prev.tasks || []).filter(
                                    (t) => t.id !== task.id
                                  ),
                                }
                              : null
                          )
                        }
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              </ColorThemeProvider>

              <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
                Location
              </Label>
              <Input
                placeholder="Event Location"
                value={editingEvent.location || ''}
                onChange={(e) =>
                  setEditingEvent((prev) =>
                    prev
                      ? { ...prev, location: e.target.value }
                      : null
                  )
                }
              />

              <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
                Edit Priority
              </Label>
              <RadioGroup
                value={editingEvent.priority || 'low'}
                onValueChange={(value) =>
                  setEditingEvent((prev) =>
                    prev
                      ? {
                          ...prev,
                          priority: value as
                            | 'low'
                            | 'medium'
                            | 'high',
                        }
                      : null
                  )
                }
                className="flex space-x-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-sm">
                    Low
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-sm">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-sm">
                    High
                  </Label>
                </div>
              </RadioGroup>

              <div className="mt-4 flex gap-4 flex-col justify-between items-center">
                <div className="w-full">
                  <Label className="block mb-2 text-sm font-medium text-muted-foreground">
                    Start Date
                  </Label>
                  <Popover
                    open={isStartDatePopoverOpen}
                    onOpenChange={setIsStartDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-left"
                      >
                        {editingEvent?.startDate ? (
                          <span className="text-muted-foreground">
                            <span className="text-inverted">
                              {new Date(
                                editingEvent.startDate
                              ).toDateString()}
                            </span>
                          </span>
                        ) : (
                          'Select a start date'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <Calendar
                        selected={
                          editingEvent?.startDate || undefined
                        }
                        onSelect={(date: Date | undefined) => {
                          setEditingEvent((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  startDate: date || new Date(),
                                }
                              : null
                          );
                          setIsStartDatePopoverOpen(false);
                        }}
                        mode="single"
                      />
                    </PopoverContent>
                  </Popover>
                  <Label className="block mb-2 mt-2 text-sm font-medium text-muted-foreground">
                    Start Time
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={startHour.toString()}
                      onValueChange={(value) =>
                        setStartHour(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateHours().map((hour) => (
                          <SelectItem
                            key={hour}
                            value={hour.toString()}
                          >
                            {hour.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={startMinute.toString()}
                      onValueChange={(value) =>
                        setStartMinute(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateMinutes().map((minute) => (
                          <SelectItem
                            key={minute}
                            value={minute.toString()}
                          >
                            {minute.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {timeFormat === '12h' && (
                      <Select
                        value={startPeriod}
                        onValueChange={(value) =>
                          setStartPeriod(value as 'AM' | 'PM')
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="w-full">
                  <Label className="block mb-2 text-sm font-medium text-muted-foreground">
                    End Date (optional)
                  </Label>
                  <Popover
                    open={isEndDatePopoverOpen}
                    onOpenChange={setIsEndDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-left"
                      >
                        {editingEvent?.endDate ? (
                          <span className="text-muted-foreground">
                            <span className="text-inverted">
                              {new Date(
                                editingEvent.endDate
                              ).toDateString()}
                            </span>
                          </span>
                        ) : (
                          'Select an end date'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <Calendar
                        selected={editingEvent?.endDate || undefined}
                        onSelect={(date: Date | undefined) => {
                          setEditingEvent((prev) =>
                            prev
                              ? { ...prev, endDate: date || null }
                              : null
                          );
                          setIsEndDatePopoverOpen(false);
                        }}
                        mode="single"
                      />
                    </PopoverContent>
                  </Popover>
                  <Label className="block mb-2 mt-2 text-sm font-medium text-muted-foreground">
                    End Time
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={endHour.toString()}
                      onValueChange={(value) =>
                        setEndHour(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateHours().map((hour) => (
                          <SelectItem
                            key={hour}
                            value={hour.toString()}
                          >
                            {hour.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={endMinute.toString()}
                      onValueChange={(value) =>
                        setEndMinute(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateMinutes().map((minute) => (
                          <SelectItem
                            key={minute}
                            value={minute.toString()}
                          >
                            {minute.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {timeFormat === '12h' && (
                      <Select
                        value={endPeriod}
                        onValueChange={(value) =>
                          setEndPeriod(value as 'AM' | 'PM')
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleEditEvent}
                className="mt-4 w-full"
              >
                {isEditingEventLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="animate-spin" size={16} />
                    Saving...
                  </div>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete this event? This action
            cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Enter the details for the new event.
            </DialogDescription>
          </DialogHeader>
          <CreateEventForm
            onCreate={handleCreateEvent}
            onClose={() => setIsEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteEventsDialogOpen}
        onOpenChange={() => setIsDeleteEventsDialogOpen(false)}
      >
        <DialogContent>
          <DialogTitle>Remove Events</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to remove events? This action cannot
            be undone, and all events will be permanently deleted.
          </DialogDescription>
          <DialogFooter className="mt-4">
            <Button
              variant="primary"
              onClick={() => setIsDeleteEventsDialogOpen(false)}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvents}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

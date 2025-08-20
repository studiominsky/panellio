import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Event, Task } from '../../../types/event-types';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  Circle,
  Loader,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { ColorThemeProvider } from '@/providers/color-theme-provider';
import { useTimeFormat } from '@/context/time-format-context';

interface CreateEventFormProps {
  onClose: () => void;
  onCreate: (event: Event) => void;
}

export default function CreateEventForm({
  onClose,
  onCreate,
}: CreateEventFormProps) {
  const { timeFormat } = useTimeFormat();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    'low'
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState<number>(9);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState<number>(10);
  const [endMinute, setEndMinute] = useState<number>(0);
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      setTasks((prevTasks) => [
        ...prevTasks,
        {
          id: Date.now().toString(),
          title: newTaskTitle,
          completed: false,
        },
      ]);
      setNewTaskTitle('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskId)
    );
  };

  const handleCreateEvent = async () => {
    if (title.trim() === '' || !startDate) return;

    setLoading(true);

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

    const newEvent: Event = {
      id: '',
      title,
      description,
      priority,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      createdAt: new Date(),
      position: 0,
      tasks,
      directoryId: '',
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      onCreate(newEvent);
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
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
    <div>
      <div className="mt-4">
        <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
          Title (required)
        </Label>
        <Input
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
          Description
        </Label>
        <Textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Tasks Section */}
        <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
          Tasks
        </Label>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New Task"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <Button size="sm" onClick={handleAddTask}>
            <PlusCircle size={16} />
          </Button>
        </div>
        <ColorThemeProvider>
          <ul className="flex flex-col gap-1 mt-2 ml-1">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center mb-1"
              >
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleToggleTask(task.id)}
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
                <button onClick={() => handleRemoveTask(task.id)}>
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
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
          Priority
        </Label>
        <RadioGroup
          value={priority}
          onValueChange={(value) =>
            setPriority(value as 'low' | 'medium' | 'high')
          }
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low" className="text-sm">
              Low
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="text-sm">
              Medium
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high" className="text-sm">
              High
            </Label>
          </div>
        </RadioGroup>

        <div className="mt-4 flex flex-col gap-4 justify-between items-center">
          <div className="w-full">
            <Label className="block mb-2 text-sm font-medium text-muted-foreground">
              Start Date (required)
            </Label>
            <Popover
              open={startCalendarOpen}
              onOpenChange={setStartCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full text-left"
                >
                  {startDate
                    ? startDate.toDateString()
                    : 'Select a start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <Calendar
                  selected={startDate || undefined}
                  onSelect={(date: Date | undefined) => {
                    setStartDate(date || null);
                    setStartCalendarOpen(false);
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
                    <SelectItem key={hour} value={hour.toString()}>
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
              open={endCalendarOpen}
              onOpenChange={setEndCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full text-left"
                >
                  {endDate
                    ? endDate.toDateString()
                    : 'Select an end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <Calendar
                  selected={endDate || undefined}
                  onSelect={(date: Date | undefined) => {
                    setEndDate(date || null);
                    setEndCalendarOpen(false);
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
                onValueChange={(value) => setEndHour(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {generateHours().map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
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
          onClick={handleCreateEvent}
          className="mt-4 w-full"
          disabled={loading || title.trim() === '' || !startDate}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader className="animate-spin" size={16} />
              Creating...
            </div>
          ) : (
            'Create Event'
          )}
        </Button>
      </div>
    </div>
  );
}

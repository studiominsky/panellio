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
import { Task } from '../../../types/task-types';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';
import { useTimeFormat } from '@/context/time-format-context';

interface CreateTaskFormProps {
  onClose: () => void;
  onCreate: (task: Task) => void;
}

export default function CreateTaskForm({
  onClose,
  onCreate,
}: CreateTaskFormProps) {
  const { timeFormat } = useTimeFormat();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    'low'
  );
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueHour, setDueHour] = useState<number>(9);
  const [dueMinute, setDueMinute] = useState<number>(0);
  const [duePeriod, setDuePeriod] = useState<'AM' | 'PM'>('AM');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    if (title.trim() === '') return;

    setLoading(true);

    let adjustedHour = dueHour;
    if (timeFormat === '12h') {
      if (duePeriod === 'PM' && dueHour !== 12) {
        adjustedHour += 12;
      } else if (duePeriod === 'AM' && dueHour === 12) {
        adjustedHour = 0;
      }
    }
    const dueTime = `${adjustedHour
      .toString()
      .padStart(2, '0')}:${dueMinute.toString().padStart(2, '0')}`;

    const newTask: Task = {
      id: '',
      title,
      description,
      priority,
      dueDate,
      dueTime,
      completed: false,
      createdAt: new Date(),
      position: 0,
      directoryId: '',
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      onCreate(newTask);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
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

  return (
    <div>
      <div className="mt-4">
        <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
          Name
        </Label>
        <Input
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
          Description
        </Label>
        <Textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
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
        </div>

        <div>
          <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
            Due Date
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full text-left">
                {dueDate ? dueDate.toDateString() : 'Select a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <Calendar
                selected={dueDate || undefined}
                onSelect={(date: Date | undefined) => {
                  setDueDate(date || null);
                  setCalendarOpen(false);
                }}
                mode="single"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
            Due Time
          </Label>
          <div className="flex gap-2">
            <Select
              value={dueHour.toString()}
              onValueChange={(value) => setDueHour(parseInt(value))}
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
              value={dueMinute.toString()}
              onValueChange={(value) => setDueMinute(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {generateMinutes().map((minute) => (
                  <SelectItem key={minute} value={minute.toString()}>
                    {minute.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {timeFormat === '12h' && (
              <Select
                value={duePeriod}
                onValueChange={(value) =>
                  setDuePeriod(value as 'AM' | 'PM')
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

        <Button
          onClick={handleCreateTask}
          className="mt-4 w-full"
          disabled={loading || title.trim() === ''}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader className="animate-spin" size={16} />
              Creating...
            </div>
          ) : (
            'Create Task'
          )}
        </Button>
      </div>
    </div>
  );
}

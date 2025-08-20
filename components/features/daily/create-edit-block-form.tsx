'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { DailyBlock } from '@/types/daily-types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { parseTimeToMinutes, formatTime } from '@/lib/time';
import { v4 as uuidv4 } from 'uuid';
import { useTimeFormat } from '@/context/time-format-context';
import { getGradientFromColorName } from '@/lib/color-utils';

interface CreateEditBlockFormProps {
  initialBlock?: DailyBlock;
  onSave: (block: DailyBlock) => void;
  onCancel: () => void;
}

export default function CreateEditBlockForm({
  initialBlock,
  onSave,
  onCancel,
}: CreateEditBlockFormProps) {
  const { timeFormat } = useTimeFormat();
  const [name, setName] = useState(initialBlock?.name || '');
  const [startHour, setStartHour] = useState<number>(() => {
    const parsed = initialBlock
      ? parseTimeToMinutes(initialBlock.startTime)
      : null;
    return parsed !== null ? Math.floor(parsed / 60) : 9;
  });
  const [startMinute, setStartMinute] = useState<number>(() => {
    const parsed = initialBlock
      ? parseTimeToMinutes(initialBlock.startTime)
      : null;
    return parsed !== null ? parsed % 60 : 0;
  });
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(() => {
    const parsed = initialBlock
      ? parseTimeToMinutes(initialBlock.startTime)
      : null;
    if (parsed !== null) {
      return parsed >= 720 ? 'PM' : 'AM';
    }
    return 'AM';
  });
  const [endHour, setEndHour] = useState<number>(() => {
    const parsed = initialBlock
      ? parseTimeToMinutes(initialBlock.endTime)
      : null;
    return parsed !== null ? Math.floor(parsed / 60) : 16;
  });
  const [endMinute, setEndMinute] = useState<number>(() => {
    const parsed = initialBlock
      ? parseTimeToMinutes(initialBlock.endTime)
      : null;
    return parsed !== null ? parsed % 60 : 30;
  });
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(() => {
    const parsed = initialBlock
      ? parseTimeToMinutes(initialBlock.endTime)
      : null;
    if (parsed !== null) {
      return parsed >= 720 ? 'PM' : 'AM';
    }
    return 'PM';
  });

  const [color, setColor] = useState(initialBlock?.color || 'blue');

  const previewGradient = useMemo(
    () => getGradientFromColorName(color ? color : 'blue'),
    [color]
  );

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      toast({
        title: 'Invalid Name',
        description: 'Block name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    const convertTo24Hour = (
      hour: number,
      minute: number,
      period: 'AM' | 'PM'
    ): string => {
      let adjustedHour = hour;
      if (timeFormat === '12h') {
        if (period === 'PM' && hour !== 12) {
          adjustedHour += 12;
        } else if (period === 'AM' && hour === 12) {
          adjustedHour = 0;
        }
      }
      return formatTime(adjustedHour, minute, '24h');
    };

    const startTimeStr = convertTo24Hour(
      startHour,
      startMinute,
      startPeriod
    );
    const endTimeStr = convertTo24Hour(endHour, endMinute, endPeriod);

    const startMinutesVal = parseTimeToMinutes(startTimeStr);
    const endMinutesVal = parseTimeToMinutes(endTimeStr);

    if (startMinutesVal === null || endMinutesVal === null) {
      toast({
        title: 'Invalid Time Format',
        description:
          'Please ensure the start and end times are valid.',
        variant: 'destructive',
      });
      return;
    }

    if (endMinutesVal <= startMinutesVal) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    const updatedBlock: DailyBlock = {
      id: initialBlock?.id || uuidv4(),
      name,
      startTime: formatTime(
        Math.floor(startMinutesVal / 60),
        startMinutesVal % 60,
        timeFormat
      ),
      endTime: formatTime(
        Math.floor(endMinutesVal / 60),
        endMinutesVal % 60,
        timeFormat
      ),
      color, // Save the selected color
      completed: initialBlock?.completed || false,
      repeat: initialBlock?.repeat || false,
      directoryId: initialBlock?.directoryId || '',
    };

    onSave(updatedBlock);
  }, [
    name,
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod,
    color,
    onSave,
    initialBlock,
    timeFormat,
  ]);

  const generateHours = () =>
    timeFormat === '12h'
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 24 }, (_, i) => i);

  const generateMinutes = () =>
    Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="mt-4">
      <div>
        <Label
          htmlFor="block-name"
          className="block mt-4 mb-2 text-sm font-medium text-muted-foreground"
        >
          Block Name
        </Label>
        <Input
          id="block-name"
          placeholder="Enter block name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex flex-col">
          <Label
            htmlFor="start-time"
            className="block mb-2 text-sm font-medium text-muted-foreground"
          >
            Start Time
          </Label>
          <div className="flex gap-2">
            <Select
              value={startHour.toString()}
              onValueChange={(value) => setStartHour(parseInt(value))}
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
                  <SelectItem key={minute} value={minute.toString()}>
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

        <div className="flex flex-col">
          <Label
            htmlFor="end-time"
            className="block mb-2 text-sm font-medium text-muted-foreground"
          >
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
              onValueChange={(value) => setEndMinute(parseInt(value))}
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

      <div className="flex items-center justify-between my-4">
        <Label className="block mb-2 text-sm font-medium text-muted-foreground">
          Block Color
        </Label>

        <div className="flex gap-1">
          <Button
            size="icon"
            variant="outline"
            className={`w-8 h-8 rounded-full ${
              color === 'green'
                ? 'border-green-500'
                : 'border-transparent'
            }`}
            onClick={() => setColor('green')}
          >
            <div className="w-5 h-5 bg-green-500 rounded-full" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className={`w-8 h-8 rounded-full ${
              color === 'blue'
                ? 'border-blue-500'
                : 'border-transparent'
            }`}
            onClick={() => setColor('blue')}
          >
            <div className="w-5 h-5 bg-blue-500 rounded-full" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className={`w-8 h-8 rounded-full ${
              color === 'orange'
                ? 'border-orange-500'
                : 'border-transparent'
            }`}
            onClick={() => setColor('orange')}
          >
            <div className="w-5 h-5 bg-orange-500 rounded-full" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={handleSubmit} className="w-full">
          {initialBlock ? 'Save Changes' : 'Add Block'}
        </Button>
      </div>
    </div>
  );
}

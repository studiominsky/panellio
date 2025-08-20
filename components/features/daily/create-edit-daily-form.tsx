'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Daily, RepeatMode } from '@/types/daily-types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { parseTimeToMinutes, formatTime } from '@/lib/time';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { useTimeFormat } from '@/context/time-format-context';

interface CreateEditDailyFormProps {
  daily: Daily | null;
  onSave: (updates: Omit<Daily, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const repeatModes: RepeatMode[] = ['none', 'everyday', 'workdays'];

export default function CreateEditDailyForm({
  daily,
  onSave,
  onCancel,
}: CreateEditDailyFormProps) {
  const { timeFormat } = useTimeFormat();
  const initialDate = daily?.date ? new Date(daily.date) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const safeParseTime = (
    time: string,
    defaultHour: number,
    defaultMinute: number
  ) => {
    const totalMinutes = parseTimeToMinutes(time);
    if (totalMinutes === null) {
      return {
        H: defaultHour,
        M: defaultMinute,
        period: 'AM' as 'AM' | 'PM',
      };
    }
    let H = Math.floor(totalMinutes / 60);
    const M = totalMinutes % 60;
    let period: 'AM' | 'PM' = 'AM';

    if (timeFormat === '12h') {
      period = H >= 12 ? 'PM' : 'AM';
      H = H % 12 === 0 ? 12 : H % 12;
    }

    return { H, M, period };
  };

  const {
    H: startH,
    M: startM,
    period: startPeriod,
  } = daily
    ? safeParseTime(daily.dayStart, 6, 0)
    : { H: 6, M: 0, period: 'AM' as 'AM' | 'PM' };

  const {
    H: endH,
    M: endM,
    period: endPeriod,
  } = daily
    ? safeParseTime(daily.dayEnd, 18, 0)
    : { H: 18, M: 0, period: 'PM' as 'AM' | 'PM' };

  const [dayStartHour, setDayStartHour] = useState<number>(startH);
  const [dayStartMinute, setDayStartMinute] =
    useState<number>(startM);
  const [dayStartPeriod, setDayStartPeriod] = useState<'AM' | 'PM'>(
    startPeriod
  );

  const [dayEndHour, setDayEndHour] = useState<number>(endH);
  const [dayEndMinute, setDayEndMinute] = useState<number>(endM);
  const [dayEndPeriod, setDayEndPeriod] = useState<'AM' | 'PM'>(
    endPeriod
  );

  const [repeatMode, setRepeatMode] = useState<RepeatMode>(
    daily?.repeatMode || 'none'
  );

  const handleSubmit = useCallback(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];

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

      // Ensure the hour is within valid range (0–23)
      adjustedHour = adjustedHour % 24;

      return formatTime(adjustedHour, minute, '24h');
    };

    const dayStart = convertTo24Hour(
      dayStartHour,
      dayStartMinute,
      dayStartPeriod
    );
    const dayEnd = convertTo24Hour(
      dayEndHour,
      dayEndMinute,
      dayEndPeriod
    );

    const startMinutes = parseTimeToMinutes(dayStart);
    const endMinutes = parseTimeToMinutes(dayEnd);

    if (startMinutes === null || endMinutes === null) {
      toast({
        title: 'Invalid Time Format',
        description:
          'Please ensure the start and end times are valid.',
        variant: 'destructive',
      });
      return;
    }

    if (endMinutes <= startMinutes) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    const updates: Omit<Daily, 'id' | 'createdAt'> = {
      date: dateStr,
      dayStart: formatTime(
        Math.floor(startMinutes / 60),
        startMinutes % 60,
        timeFormat
      ),
      dayEnd: formatTime(
        Math.floor(endMinutes / 60),
        endMinutes % 60,
        timeFormat
      ),
      repeatMode,
      blocks: daily?.blocks || [],
    };

    onSave(updates);
  }, [
    selectedDate,
    dayStartHour,
    dayStartMinute,
    dayStartPeriod,
    dayEndHour,
    dayEndMinute,
    dayEndPeriod,
    repeatMode,
    daily?.blocks,
    onSave,
    timeFormat,
  ]);

  const generateHours = () => {
    return timeFormat === '12h'
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 24 }, (_, i) => i);
  };

  const generateMinutes = () => {
    return Array.from({ length: 12 }, (_, i) => i * 5);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-1 mt-3 block text-sm font-medium text-muted-foreground">
          Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full text-left">
              {selectedDate.toDateString()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col w-full md:w-1/2">
          <Label className="mb-1 block text-sm font-medium text-muted-foreground">
            Start Time
          </Label>
          <div className="flex gap-2">
            <Select
              value={dayStartHour.toString()}
              onValueChange={(value) =>
                setDayStartHour(parseInt(value))
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
              value={dayStartMinute.toString()}
              onValueChange={(value) =>
                setDayStartMinute(parseInt(value))
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
                value={dayStartPeriod}
                onValueChange={(value) =>
                  setDayStartPeriod(value as 'AM' | 'PM')
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

        <div className="flex flex-col w-full md:w-1/2">
          <Label className="mb-1 block text-sm font-medium text-muted-foreground">
            End Time
          </Label>
          <div className="flex gap-2">
            <Select
              value={dayEndHour.toString()}
              onValueChange={(value) =>
                setDayEndHour(parseInt(value))
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
              value={dayEndMinute.toString()}
              onValueChange={(value) =>
                setDayEndMinute(parseInt(value))
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
                value={dayEndPeriod}
                onValueChange={(value) =>
                  setDayEndPeriod(value as 'AM' | 'PM')
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

      <div>
        <Label className="mb-2 block text-sm font-medium text-muted-foreground">
          Repeat Mode
        </Label>
        <Select
          value={repeatMode}
          onValueChange={(value) =>
            setRepeatMode(value as RepeatMode)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select repeat mode" />
          </SelectTrigger>
          <SelectContent className="border border-border">
            {repeatModes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode === 'none'
                  ? 'No Repetition'
                  : mode === 'everyday'
                  ? 'Every Day'
                  : 'Workdays Only'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={handleSubmit} className="w-full">
          {daily ? 'Save Changes' : 'Create Daily'}
        </Button>
      </div>
    </div>
  );
}

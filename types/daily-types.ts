// types/daily-types.ts

export type RepeatMode = 'none' | 'everyday' | 'workdays';

export interface DailyBlock {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  repeat: boolean;
  color?: string;
  directoryId: string;
}

export interface Daily {
  id: string;
  date: string;
  dayStart: string;
  dayEnd: string;
  repeatMode: RepeatMode;
  blocks: DailyBlock[];
  createdAt: Date;
}

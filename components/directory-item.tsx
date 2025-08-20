// components/directory-item.tsx

import AssetsComponent from '@/components/assets/assets-component';
import TasksFeature from '@/components/features/tasks/task-feature';
import EventsFeature from './features/events/event-feature';
import DailyFeature from './features/daily/daily-feature';
import NodesFeature from './features/nodes/nodes-feature';
import { DirectoryItem } from '@/types/directory-type';
import PlacesFeature from './features/places/places-feature';
import TablesFeature from './features/tables/tables-feature';
import StickyNote from './sticky-notes/sticky-note';
import NotesFeature from './features/notes/notes-feature';
import DictionaryFeature from './features/dictionary/dictionary-feature';
import HabitsFeature from '@/components/features/habits/habits-feature';

export const directoryItemComponents: {
  [key: string]: React.FC<{
    directoryId: string;
    onDirectoryItemRemoved: (itemId: string) => void;
    width: number;
    height: number;
    itemData: DirectoryItem;
    mapRefreshKey: number;
  }>;
} = {
  assets: AssetsComponent,
  tasks: TasksFeature,
  habits: HabitsFeature,
  events: EventsFeature,
  daily: DailyFeature,
  places: PlacesFeature,
  nodes: NodesFeature,
  tables: TablesFeature,
  stickyNote: StickyNote,
  notes: NotesFeature,
  dictionary: DictionaryFeature,
};

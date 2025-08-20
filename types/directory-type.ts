export interface DirectoryItem {
  id: string;
  name: string;
  directoryId?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  text?: string;
  color?: string;
  tags?: string[];
}

export type Directory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  items?: DirectoryItem[];
  grid?: string;
  position: number;
};

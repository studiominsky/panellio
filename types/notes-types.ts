export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
}

export type CreateNotePayload = Pick<
  Note,
  'title' | 'content' | 'tags'
>;

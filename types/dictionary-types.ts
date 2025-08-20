// types/dictionary-types.ts
export interface DictionaryItem {
  id: string;
  title: string;
  text: string;
  visibleText: string;
  hiddenText: string;
  difficulty: number;
  tags: string[];
  color: string;
  createdAt: Date;
}

export type CreateDictionaryItemPayload = Pick<
  DictionaryItem,
  | 'title'
  | 'text'
  | 'visibleText'
  | 'hiddenText'
  | 'difficulty'
  | 'tags'
  | 'color'
>;

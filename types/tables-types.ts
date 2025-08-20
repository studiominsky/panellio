export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'link'
  | 'boolean';

export interface FieldDefinition {
  id: string;
  key: string;
  label: string;
  type: FieldType;
}

export interface Table {
  id: string;
  name?: string;
  description?: string;
  fieldDefinitions?: FieldDefinition[];
  createdAt: Date;
}

export interface TableItem {
  id: string;
  data: Record<string, any>;
  createdAt: Date;
}

export type CreateTablePayload = Partial<
  Pick<Table, 'name' | 'description'>
> & {
  fieldDefinitions?: FieldDefinition[];
};

export type CreateTableItemPayload = Omit<
  TableItem,
  'id' | 'createdAt'
>;

'use client';

import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import { CheckCircle, Circle, Ellipsis, Trash2 } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { TableItem, FieldDefinition } from '@/types/tables-types';

interface TableItemsTableProps {
  items: TableItem[];
  fieldDefinitions: FieldDefinition[];
  onEdit: (item: TableItem) => void;
  onDelete: (item: TableItem) => void;
  onAddItemClick: () => void;
  onEditTableClick: () => void;
  onRemoveTableClick: () => void;
}

export default function TableItemsTable({
  items,
  fieldDefinitions,
  onEdit,
  onDelete,
  onAddItemClick,
  onEditTableClick,
  onRemoveTableClick,
}: TableItemsTableProps) {
  const renderCellValue = (
    item: TableItem,
    field: FieldDefinition
  ) => {
    const value = item.data[field.key];

    if (value === undefined || value === null) return null;

    if (field.type === 'date') {
      try {
        const dateObj =
          typeof value === 'string' ? parseISO(value) : value;
        return format(dateObj, 'dd.MM.yyyy');
      } catch {
        return value;
      }
    }

    if (field.type === 'link') {
      return (
        <a
          href={`https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {value}
        </a>
      );
    }

    if (field.type === 'boolean') {
      return (
        <div className="flex items-center justify-start">
          {value ? (
            <CheckCircle size={18} className="text-[--ui-primary]" />
          ) : (
            <Circle size={18} className="text-[--ui-primary]" />
          )}
        </div>
      );
    }

    return value;
  };

  return (
    <div className="relative z-0 w-full overflow-x-auto">
      <Table className="min-w-full table-auto">
        <TableHeader>
          <TableRow>
            {fieldDefinitions.map((field) => (
              <TableHead key={field.id} className="pr-4 text-start">
                {field.label || field.key}
              </TableHead>
            ))}
            <TableHead className="text-start">
              <Menubar className="justify-end">
                <MenubarMenu>
                  <MenubarTrigger asChild variant="ellipsis">
                    <button
                      className="inline-flex p-1"
                      aria-label="Table Actions"
                    >
                      <Ellipsis size={20} />
                    </button>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={onAddItemClick}>
                      Add Item
                    </MenubarItem>
                    <MenubarItem onClick={onEditTableClick}>
                      Edit Table
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem
                      variant="destructive"
                      onClick={onRemoveTableClick}
                    >
                      Remove Table
                      <MenubarShortcut>
                        <Trash2
                          size={14}
                          className="text-[--red-500]"
                        />
                      </MenubarShortcut>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {fieldDefinitions.map((field) => (
                <TableCell key={field.id} className="pr-2">
                  {renderCellValue(item, field)}
                </TableCell>
              ))}
              <TableCell className="text-right whitespace-nowrap">
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger asChild variant="ellipsis">
                      <button
                        className="p-2 justify-end ml-auto"
                        aria-label="Item Actions"
                      >
                        <Ellipsis size={16} />
                      </button>
                    </MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem onClick={() => onEdit(item)}>
                        Edit Item
                      </MenubarItem>
                      <MenubarItem onClick={() => onDelete(item)}>
                        Delete Item
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

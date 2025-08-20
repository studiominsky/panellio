'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableItem,
  CreateTableItemPayload,
} from '@/types/tables-types';
import TableItemsTable from './table-items-table';
import CreateTableItemForm from './create-table-item-form';
import EditTableForm from './edit-table-form';
import { CheckCircle, Circle } from 'lucide-react';

export interface TableTabProps {
  directoryId: string;
  table: Table;
  items: TableItem[];
  onAddItem: (
    tableId: string,
    payload: CreateTableItemPayload
  ) => void;
  onEditItem: (tableId: string, item: TableItem) => void;
  onDeleteItem: (tableId: string, itemId: string) => void;
  onRemoveTable: (tableId: string) => void;
  onEditTable: (tableId: string, updatedTable: Table) => void;
}

export default function TableTab({
  directoryId,
  table,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onRemoveTable,
  onEditTable,
}: TableTabProps) {
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] =
    useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] =
    useState(false);
  const [editingItem, setEditingItem] = useState<TableItem | null>(
    null
  );
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] =
    useState(false);
  const [itemToDelete, setItemToDelete] = useState<TableItem | null>(
    null
  );
  const [isEditTableDialogOpen, setIsEditTableDialogOpen] =
    useState(false);
  const [isRemoveTableDialogOpen, setIsRemoveTableDialogOpen] =
    useState(false);

  const openEditItemDialog = (item: TableItem) => {
    setEditingItem(item);

    const convertedData: Record<string, any> = { ...item.data };
    (table.fieldDefinitions || []).forEach((field) => {
      if (field.type === 'date' && item.data[field.key]) {
        try {
          convertedData[field.key] = parseISO(item.data[field.key]);
        } catch {
          convertedData[field.key] = null;
        }
      }
    });

    setEditData(convertedData);
    setIsEditItemDialogOpen(true);
  };

  const handleEditChange = (key: string, value: any) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditItemSave = () => {
    if (!editingItem) return;
    const updatedData: Record<string, any> = { ...editData };
    (table.fieldDefinitions || []).forEach((field) => {
      if (
        field.type === 'date' &&
        updatedData[field.key] instanceof Date
      ) {
        updatedData[field.key] = updatedData[field.key].toISOString();
      }
    });

    const updatedItem: TableItem = {
      ...editingItem,
      data: updatedData,
      createdAt: editingItem.createdAt,
    };

    onEditItem(table.id, updatedItem);
    setIsEditItemDialogOpen(false);
    setEditingItem(null);
  };

  const confirmDeleteItem = (item: TableItem) => {
    setItemToDelete(item);
    setIsDeleteItemDialogOpen(true);
  };

  const handleDeleteItemConfirm = () => {
    if (itemToDelete) {
      onDeleteItem(table.id, itemToDelete.id);
      setIsDeleteItemDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleAddItemClick = () => {
    setIsAddItemDialogOpen(true);
  };
  const handleEditTableClick = () => {
    setIsEditTableDialogOpen(true);
  };
  const handleRemoveTableClick = () => {
    setIsRemoveTableDialogOpen(true);
  };

  return (
    <div className="relative h-full">
      <TableItemsTable
        items={items}
        fieldDefinitions={table.fieldDefinitions || []}
        onEdit={openEditItemDialog}
        onDelete={confirmDeleteItem}
        onAddItemClick={handleAddItemClick}
        onEditTableClick={handleEditTableClick}
        onRemoveTableClick={handleRemoveTableClick}
      />

      <Dialog
        open={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Enter details for the new table item.
            </DialogDescription>
          </DialogHeader>
          <CreateTableItemForm
            directoryId={directoryId}
            tableId={table.id}
            fieldDefinitions={table.fieldDefinitions || []}
            onCreate={(payload) => onAddItem(table.id, payload)}
            onClose={() => setIsAddItemDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditItemDialogOpen}
        onOpenChange={setIsEditItemDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Edit the details of this item.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="mt-4 space-y-4">
              {(table.fieldDefinitions || []).map((field) => {
                if (field.type === 'date') {
                  const selectedDate = editData[field.key] || null;
                  return (
                    <div key={field.id}>
                      <Label className="block text-sm font-medium text-muted-foreground">
                        {field.label}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-2 w-full justify-start text-left font-normal"
                          >
                            {selectedDate
                              ? format(selectedDate, 'dd.MM.yyyy')
                              : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-50"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) =>
                              handleEditChange(field.key, date)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  );
                }

                if (field.type === 'number') {
                  return (
                    <div key={field.id}>
                      <Label className="block text-sm font-medium text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        type="number"
                        value={editData[field.key] || ''}
                        onChange={(e) =>
                          handleEditChange(field.key, e.target.value)
                        }
                        className="mt-2"
                      />
                    </div>
                  );
                }

                if (field.type === 'link') {
                  return (
                    <div key={field.id}>
                      <Label className="block text-sm font-medium text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        type="url"
                        value={editData[field.key] || ''}
                        onChange={(e) =>
                          handleEditChange(field.key, e.target.value)
                        }
                        className="mt-2"
                      />
                    </div>
                  );
                }

                if (field.type === 'boolean') {
                  return (
                    <div
                      key={field.id}
                      className="flex items-center justify-between mb-4"
                    >
                      <Label className="text-sm font-medium text-muted-foreground">
                        {field.label}
                      </Label>
                      <button
                        onClick={() =>
                          handleEditChange(
                            field.key,
                            !editData[field.key]
                          )
                        }
                        className="focus:outline-none"
                        aria-label={
                          editData[field.key]
                            ? 'Set to false'
                            : 'Set to true'
                        }
                      >
                        {editData[field.key] ? (
                          <CheckCircle
                            size={18}
                            className="text-[--ui-primary]"
                          />
                        ) : (
                          <Circle
                            size={18}
                            className="text-[--ui-primary]"
                          />
                        )}
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={field.id}>
                    <Label className="block text-sm font-medium text-muted-foreground">
                      {field.label}
                    </Label>
                    <Input
                      value={editData[field.key] || ''}
                      onChange={(e) =>
                        handleEditChange(field.key, e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>
                );
              })}

              <Button
                onClick={handleEditItemSave}
                className="mt-4 w-full"
              >
                Update Item
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteItemDialogOpen}
        onOpenChange={setIsDeleteItemDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="primary"
              onClick={() => setIsDeleteItemDialogOpen(false)}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteItemConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditTableDialogOpen}
        onOpenChange={setIsEditTableDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Edit the table details and dynamic fields.
            </DialogDescription>
          </DialogHeader>
          <EditTableForm
            table={table}
            onSave={(updatedTable: Table) => {
              onEditTable(table.id, updatedTable);
              setIsEditTableDialogOpen(false);
            }}
            onClose={() => setIsEditTableDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRemoveTableDialogOpen}
        onOpenChange={setIsRemoveTableDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the table &quot;
              {table.name || 'Untitled Table'}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="primary"
              onClick={() => setIsRemoveTableDialogOpen(false)}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onRemoveTable(table.id)}
            >
              Delete Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

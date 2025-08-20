'use client';

import React, { useEffect, useState } from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import { Ellipsis, Maximize2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Table, TableItem } from '@/types/tables-types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import {
  getTables,
  getTableItems,
  deleteTable,
  deleteTables,
  updateTable,
} from '@/services/tables-services';
import TableTab from './table-tab';
import CreateTableForm from './create-table-form';
import { DirectoryItem } from '@/types/directory-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TablesFeatureProps {
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
  width: number;
  height: number;
}

export default function TablesFeature({
  directoryId,
  onDirectoryItemRemoved,
  itemData,
  width,
  height,
}: TablesFeatureProps) {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [tableItems, setTableItems] = useState<
    Record<string, TableItem[]>
  >({});
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] =
    useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeleteTablesDialogOpen, setIsDeleteTablesDialogOpen] =
    useState(false);

  const [activeTableId, setActiveTableId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user && directoryId) {
      const fetchTables = async () => {
        try {
          const fetchedTables = await getTables(
            user.uid,
            directoryId
          );
          setTables(fetchedTables);
          // Set active table to first table if available
          if (fetchedTables.length > 0) {
            setActiveTableId(fetchedTables[0].id);
          }
          fetchedTables.forEach(async (table) => {
            const items = await getTableItems(
              user.uid,
              directoryId,
              table.id
            );
            setTableItems((prev) => ({ ...prev, [table.id]: items }));
          });
        } catch (error) {
          console.error('Error fetching tables:', error);
        }
      };
      fetchTables();
    }
  }, [user, directoryId]);

  const handleCreateTable = (newTable: Table) => {
    setTables((prev) => [...prev, newTable]);
    setTableItems((prev) => ({ ...prev, [newTable.id]: [] }));
    toast({ title: 'Table added successfully.' });
  };

  const handleAddTableItem = (
    tableId: string,
    payload: { data: Record<string, any> }
  ) => {
    const newItem: TableItem = {
      id: Date.now().toString(),
      data: payload.data,
      createdAt: new Date(),
    };
    setTableItems((prev) => ({
      ...prev,
      [tableId]: [...(prev[tableId] || []), newItem],
    }));
    toast({ title: 'Item added successfully.' });
  };

  const handleEditTableItem = (
    tableId: string,
    updatedItem: TableItem
  ) => {
    setTableItems((prev) => ({
      ...prev,
      [tableId]: prev[tableId].map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
    toast({ title: 'Item updated successfully.' });
  };

  const handleDeleteTableItem = (tableId: string, itemId: string) => {
    setTableItems((prev) => ({
      ...prev,
      [tableId]: prev[tableId].filter((item) => item.id !== itemId),
    }));
    toast({ title: 'Item removed successfully.' });
  };

  const handleRemoveTable = async (tableId: string) => {
    if (!user) return;
    try {
      await deleteTable(user.uid, directoryId, tableId);
      setTables((prev) =>
        prev.filter((table) => table.id !== tableId)
      );
      setTableItems((prev) => {
        const newState = { ...prev };
        delete newState[tableId];
        return newState;
      });
      toast({ title: 'Table removed successfully.' });
    } catch (error) {
      console.error('Error removing table:', error);
      toast({
        title: 'Could not remove table.',
        description: String(error),
        variant: 'destructive',
      });
    }
  };
  const handleEditTable = async (
    tableId: string,
    updatedTable: Table
  ) => {
    if (!user) return;
    try {
      await updateTable(user.uid, directoryId, tableId, updatedTable);
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? updatedTable : table
        )
      );
      toast({ title: 'Table updated successfully.' });
    } catch (error) {
      console.error('Error updating table:', error);
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTables = async () => {
    if (!user) return;
    try {
      await deleteTables(user.uid, directoryId);
      setTables([]);
      setTableItems({});
      toast({ title: 'Tables removed successfully.' });
      onDirectoryItemRemoved(itemData.id);
    } catch (error) {
      console.error('Error removing tables:', error);
      toast({
        title: 'Could not remove tables.',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setIsDeleteTablesDialogOpen(false);
    }
  };

  return (
    <div
      style={{ position: 'relative', height: `calc(100% - 2rem)` }}
    >
      <Menubar className="directory-item-drag-handle cursor-grab py-4 relative z-10 px-6 rounded-none border border-border rounded-t-2xl top-0 bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ghost"
            className="bg-muted h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => setIsCreateTableDialogOpen(true)}
            >
              Add Table
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => setIsFullscreen(true)}>
              Fullscreen
              <MenubarShortcut>
                <Maximize2 size={14} />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              onClick={() => setIsDeleteTablesDialogOpen(true)}
              variant="destructive"
            >
              Remove Tables
              <MenubarShortcut>
                <Trash2 className="text-red-500" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="bg-card p-4 h-full overflow-auto border-l border-r border-b border-border">
        {tables.length > 0 ? (
          <Tabs
            value={activeTableId}
            onValueChange={(value) => setActiveTableId(value)}
          >
            <TabsList className="overflow-auto">
              {tables.map((table) => (
                <TabsTrigger key={table.id} value={table.id}>
                  {table.name || 'Untitled Table'}
                </TabsTrigger>
              ))}
            </TabsList>
            {tables.map((table) => {
              const filteredItems = (
                tableItems[table.id] || []
              ).filter((item) =>
                JSON.stringify(item.data)
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              );
              return (
                <TabsContent key={table.id} value={table.id}>
                  <div className="mb-4 flex justify-between items-center">
                    <div>
                      {table.description && (
                        <p className="text-sm text-muted-foreground">
                          {table.description}
                        </p>
                      )}
                    </div>
                    {activeTableId === table.id && (
                      <div>
                        {width > 5 && (
                          <Input
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) =>
                              setSearchQuery(e.target.value)
                            }
                            className="w-48"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <TableTab
                    directoryId={directoryId}
                    table={table}
                    items={filteredItems}
                    onAddItem={handleAddTableItem}
                    onEditItem={handleEditTableItem}
                    onDeleteItem={handleDeleteTableItem}
                    onRemoveTable={handleRemoveTable}
                    onEditTable={handleEditTable}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div className="py-1 pt-4 flex flex-wrap gap-8">
            <p className="text-sm text-muted-foreground">
              No tables added yet.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="min-w-[90%] min-h-[80%] p-0 rounded-t-2xl rounded-b-none"
          style={{ height: '90vh' }}
        >
          <Menubar className="cursor-grab h-8 z-10 px-6 bg-muted flex justify-between">
            <MenubarMenu>
              <MenubarTrigger
                variant="ghost"
                className="bg-muted h-4 p-1 absolute right-6"
              >
                <Ellipsis size={23} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => setIsCreateTableDialogOpen(true)}
                >
                  Add Table
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setIsFullscreen(false)}>
                  Exit Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  variant="destructive"
                  onClick={() => setIsDeleteTablesDialogOpen(true)}
                >
                  Remove Tables
                  <MenubarShortcut>
                    <Trash2 className="text-[--red-500]" size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <div className="p-4 overflow-auto">
            {tables.length > 0 ? (
              <Tabs
                value={activeTableId}
                onValueChange={setActiveTableId}
              >
                <TabsList className="overflow-auto">
                  {tables.map((table) => (
                    <TabsTrigger key={table.id} value={table.id}>
                      {table.name || 'Untitled Table'}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {tables.map((table) => {
                  const filteredItems = (
                    tableItems[table.id] || []
                  ).filter((item) =>
                    JSON.stringify(item.data)
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  );
                  return (
                    <TabsContent key={table.id} value={table.id}>
                      <div className="mb-4 flex justify-between items-center">
                        <div>
                          {table.description && (
                            <p className="text-sm text-muted-foreground">
                              {table.description}
                            </p>
                          )}
                        </div>
                        {activeTableId === table.id && (
                          <div>
                            <Input
                              placeholder="Search items..."
                              value={searchQuery}
                              onChange={(e) =>
                                setSearchQuery(e.target.value)
                              }
                              className="w-48"
                            />
                          </div>
                        )}
                      </div>
                      <TableTab
                        directoryId={directoryId}
                        table={table}
                        items={filteredItems}
                        onAddItem={() => {}}
                        onEditItem={() => {}}
                        onDeleteItem={() => {}}
                        onRemoveTable={() => {}}
                        onEditTable={() => {}}
                      />
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tables added yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateTableDialogOpen}
        onOpenChange={setIsCreateTableDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
            <DialogDescription>
              Enter the table title, description, and define its
              dynamic fields.
            </DialogDescription>
          </DialogHeader>
          <CreateTableForm
            directoryId={directoryId}
            onCreate={handleCreateTable}
            onClose={() => setIsCreateTableDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteTablesDialogOpen}
        onOpenChange={setIsDeleteTablesDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Tables</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all tables? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              className="mr-2"
              onClick={() => setIsDeleteTablesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTables}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

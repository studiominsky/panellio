'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import { useAuth } from '@/context/auth-context';
import {
  getNodePanels,
  addNodePanel,
  deleteNodePanel,
  updateNodePanel,
  deleteAllNodePanels,
} from '@/services/nodes-service';
import NodesPanel from './nodes-panel';
import { toast } from '@/hooks/use-toast';
import { Ellipsis, Trash2, Edit2, Maximize2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { NodePanel } from '@/types/nodes-types';
import AddNodeDialog from './add-node-dialog';
import { DirectoryItem } from '@/types/directory-type';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NodesFeatureProps {
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
}

const NodesFeature: React.FC<NodesFeatureProps> = ({
  directoryId,
  itemData,
  onDirectoryItemRemoved,
}) => {
  const { user } = useAuth();
  const [panels, setPanels] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPanelName, setNewPanelName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] =
    useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(
    null
  );
  const [editingPanelName, setEditingPanelName] = useState('');
  const [editingPanelEdgeType, setEditingPanelEdgeType] = useState<
    'smoothstep' | 'default' | 'straight'
  >('default');
  const [isConfirmDeleteFeatureOpen, setIsConfirmDeleteFeatureOpen] =
    useState(false);

  useEffect(() => {
    const fetchPanels = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const fetchedPanels = await getNodePanels(
          user.uid,
          directoryId
        );
        setPanels(fetchedPanels);
        if (fetchedPanels.length > 0) {
          setActiveTab(fetchedPanels[0].panelId);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load node panels.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPanels();
  }, [user, directoryId]);

  const handleAddPanel = async () => {
    if (!user || !newPanelName.trim()) return;
    try {
      const newPanelId = await addNodePanel(user.uid, directoryId, {
        name: newPanelName,
        nodes: [],
        edges: [],
        edgeType: 'default',
        directoryId,
      });
      const newPanel = {
        panelId: newPanelId,
        name: newPanelName,
        nodes: [],
        edges: [],
        edgeType: 'default',
      };
      setPanels((prev) => [...prev, newPanel]);
      setActiveTab(newPanelId);
      toast({
        title: 'Success',
        description: 'New panel added successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add panel.',
        variant: 'destructive',
      });
    } finally {
      setIsAddDialogOpen(false);
      setNewPanelName('');
    }
  };

  const handleAddNode = async (label: string, color: string) => {
    if (!activeTab || !user) return;

    const activePanelIndex = panels.findIndex(
      (panel) => panel.panelId === activeTab
    );
    if (activePanelIndex === -1) return;

    const activePanel = panels[activePanelIndex];

    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      data: { label, color },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };

    const updatedNodes = [...activePanel.nodes, newNode];

    const updatedPanel = { ...activePanel, nodes: updatedNodes };
    const updatedPanels = panels.map((panel, index) =>
      index === activePanelIndex ? updatedPanel : panel
    );

    setPanels(updatedPanels);

    try {
      await updateNodePanel(
        user.uid,
        directoryId,
        activePanel.panelId,
        {
          nodes: updatedNodes,
          edges: activePanel.edges,
        }
      );

      toast({
        title: 'Success',
        description: 'Node added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add node.',
        variant: 'destructive',
      });
    }
  };

  const handleEditPanel = async () => {
    if (!user || !editingPanelId || !editingPanelName.trim()) return;

    try {
      const updatedPanel: Partial<NodePanel> = {
        name: editingPanelName,
        edgeType: editingPanelEdgeType as
          | 'smoothstep'
          | 'default'
          | 'straight',
      };

      await updateNodePanel(
        user.uid,
        directoryId,
        editingPanelId,
        updatedPanel
      );

      setPanels((prev) =>
        prev.map((panel) =>
          panel.panelId === editingPanelId
            ? { ...panel, ...updatedPanel }
            : panel
        )
      );

      toast({
        title: 'Success',
        description: 'Panel updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update panel.',
        variant: 'destructive',
      });
    } finally {
      setIsEditDialogOpen(false);
      setEditingPanelId(null);
      setEditingPanelName('');
      setEditingPanelEdgeType('default');
    }
  };

  const handleDeletePanel = async (panelId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await deleteNodePanel(user.uid, directoryId, panelId);
      setPanels((prev) =>
        prev.filter((panel) => panel.panelId !== panelId)
      );
      if (activeTab === panelId && panels.length > 1) {
        setActiveTab(panels[0].panelId);
      } else if (panels.length === 1) {
        setActiveTab(null);
      }
      toast({
        title: 'Success',
        description: 'Panel deleted successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete panel.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeature = async () => {
    if (!user) return;
    setIsDeleteLoading(true);
    try {
      await deleteAllNodePanels(user.uid, directoryId);
      onDirectoryItemRemoved(itemData.id);
      toast({
        title: 'Success',
        description: 'Nodes feature removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove nodes feature.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteLoading(false);
      setIsConfirmDeleteFeatureOpen(false);
    }
  };

  return (
    <div
      style={{ position: 'relative', height: 'calc(100% - 2rem)' }}
    >
      <Menubar className="directory-item-drag-handle cursor-grab py-4 relative z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ghost"
            className="bg-muted h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsAddDialogOpen(true)}>
              Add Panel
            </MenubarItem>
            <MenubarItem
              onClick={() => setIsAddNodeDialogOpen(true)}
              disabled={!activeTab}
            >
              Add Node
            </MenubarItem>
            <MenubarItem
              onClick={() => {
                if (activeTab) {
                  const activePanel = panels.find(
                    (p) => p.panelId === activeTab
                  );
                  if (activePanel) {
                    setEditingPanelId(activeTab);
                    setEditingPanelName(activePanel.name);
                    setEditingPanelEdgeType(
                      activePanel.edgeType || 'default'
                    );
                    setIsEditDialogOpen(true);
                  }
                }
              }}
              disabled={!activeTab}
            >
              Edit Panel
              <MenubarShortcut>
                <Edit2 size={16} />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              onClick={() => {
                if (activeTab) {
                  handleDeletePanel(activeTab);
                }
              }}
              disabled={!activeTab}
              variant="destructive"
            >
              Delete Panel
              <MenubarShortcut>
                <Trash2 className="text-[--red-500]" size={14} />
              </MenubarShortcut>
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
              variant="destructive"
              onClick={() => setIsConfirmDeleteFeatureOpen(true)}
            >
              Remove Nodes
              <MenubarShortcut>
                <Trash2 className="text-[--red-500]" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="p-4 h-full p border-b border-l border-r border-border bg-card">
        {panels.length === 0 ? (
          <div className="py-1 pt-4 flex flex-wrap gap-8">
            <p className="text-sm text-muted-foreground">
              No panels added yet.
            </p>
          </div>
        ) : (
          <Tabs
            value={activeTab || ''}
            onValueChange={(value) => setActiveTab(value)}
            className="w-full h-full"
          >
            <TabsList className="w-full fixed z-20">
              {panels.map((panel) => (
                <TabsTrigger
                  key={panel.panelId}
                  value={panel.panelId}
                >
                  {panel.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {panels.map((panel) => (
              <TabsContent key={panel.panelId} value={panel.panelId}>
                <NodesPanel
                  panel={panel}
                  userId={user?.uid || ''}
                  directoryId={directoryId}
                  onDeletePanel={() =>
                    handleDeletePanel(panel.panelId)
                  }
                  onPanelUpdate={(updatedPanel) =>
                    setPanels((prev) =>
                      prev.map((p) =>
                        p.panelId === updatedPanel.panelId
                          ? updatedPanel
                          : p
                      )
                    )
                  }
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="min-w-[90%] min-h-[80%] max-w-[95%] max-h-[85%] p-0 rounded-t-2xl"
        >
          <DialogDescription className="sr-only">
            Fullscreen view of Nodes panel
          </DialogDescription>
          <Menubar className="cursor-grab h-8 z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
            <MenubarMenu>
              <MenubarTrigger
                variant="ghost"
                className="bg-muted h-4 p-1 absolute right-6"
              >
                <Ellipsis size={23} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => setIsAddDialogOpen(true)}>
                  Add Panel
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setIsFullscreen(false)}>
                  Exit Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <div className="h-[80vh]">
            {activeTab && (
              <NodesPanel
                panel={panels.find(
                  (panel) => panel.panelId === activeTab
                )}
                userId={user?.uid || ''}
                directoryId={directoryId}
                onDeletePanel={() => handleDeletePanel(activeTab)}
                onPanelUpdate={(updatedPanel) =>
                  setPanels((prev) =>
                    prev.map((p) =>
                      p.panelId === updatedPanel.panelId
                        ? updatedPanel
                        : p
                    )
                  )
                }
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Panel</DialogTitle>
            <DialogDescription>
              Change the name and edge type of your panel.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="mb-2 mt-4 block text-sm font-medium text-muted-foreground">
              Panel Name
            </Label>
            <Input
              value={editingPanelName}
              onChange={(e) => setEditingPanelName(e.target.value)}
              placeholder="Enter new panel name"
            />
            <Label className="mb-2 mt-4 block text-sm font-medium text-muted-foreground">
              Edge Type
            </Label>
            <Select
              value={editingPanelEdgeType}
              onValueChange={(value) =>
                setEditingPanelEdgeType(
                  value as 'smoothstep' | 'default' | 'straight'
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Edge Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="smoothstep">
                  Smooth Step
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditPanel}
              disabled={!editingPanelName.trim()}
              className="mt-4 w-full"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Panel</DialogTitle>
            <DialogDescription>
              Add a new panel to your nodes feature.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newPanelName}
            className="mt-4"
            onChange={(e) => setNewPanelName(e.target.value)}
            placeholder="Enter panel name"
          />
          <DialogFooter className="mt-4">
            <Button
              onClick={handleAddPanel}
              disabled={!newPanelName.trim()}
              className="w-full"
            >
              Add Panel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddNodeDialog
        isOpen={isAddNodeDialogOpen}
        onClose={() => setIsAddNodeDialogOpen(false)}
        onAddNode={handleAddNode}
      />

      <Dialog
        open={isConfirmDeleteFeatureOpen}
        onOpenChange={setIsConfirmDeleteFeatureOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Nodes Feature</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the Nodes feature? This
              will delete all panels and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => setIsConfirmDeleteFeatureOpen(false)}
              disabled={isDeleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFeature}
              disabled={isDeleteLoading}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NodesFeature;

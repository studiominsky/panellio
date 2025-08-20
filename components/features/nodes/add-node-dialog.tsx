import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (label: string, color: string) => void;
}

const AddNodeDialog: React.FC<AddNodeDialogProps> = ({
  isOpen,
  onClose,
  onAddNode,
}) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#ffffff');

  const handleAddNode = () => {
    onAddNode(label, color);
    setLabel('');
    setColor('#ffffff');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Node</DialogTitle>
          <DialogDescription>
            Add a new node to the panel
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter node label"
            className="mt-4"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={handleAddNode}
            disabled={!label.trim()}
            className="w-full"
          >
            Add Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNodeDialog;

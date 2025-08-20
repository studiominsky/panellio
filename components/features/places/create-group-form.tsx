'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateGroupFormProps {
  onCreate: (groupName: string) => void;
  onClose: () => void;
}

export default function CreateGroupForm({
  onCreate,
  onClose,
}: CreateGroupFormProps) {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = () => {
    if (groupName.trim()) {
      onCreate(groupName.trim());
    }
  };

  return (
    <div>
      <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
        Group Name
      </Label>
      <Input
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter group name"
      />
      <Button className="w-full mt-4" onClick={handleSubmit}>
        Create Group
      </Button>
    </div>
  );
}

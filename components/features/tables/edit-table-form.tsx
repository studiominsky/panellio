'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';
import { Table, FieldDefinition } from '@/types/tables-types';

interface EditTableFormProps {
  table: Table;
  onClose: () => void;
  onSave: (updatedTable: Table) => void;
}

export default function EditTableForm({
  table,
  onClose,
  onSave,
}: EditTableFormProps) {
  const [name, setName] = useState(table.name || '');
  const [description, setDescription] = useState(
    table.description || ''
  );
  const [fields, setFields] = useState<FieldDefinition[]>(
    table.fieldDefinitions || []
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const trimmedName = name.trim() || 'Untitled Table';
    const trimmedDescription = description.trim();

    onSave({
      ...table,
      name: trimmedName,
      description: trimmedDescription,
      fieldDefinitions: fields,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="space-y-4">
      <Label className="block text-sm font-medium text-muted-foreground">
        Table Title (optional)
      </Label>
      <Input
        placeholder="Table Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-2"
      />

      <Label className="block text-sm font-medium text-muted-foreground mt-4">
        Description (optional)
      </Label>
      <Textarea
        placeholder="Table Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2"
      />

      <Button
        onClick={handleSubmit}
        className="mt-4 w-full"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader size={16} className="animate-spin" />
            Saving...
          </div>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}

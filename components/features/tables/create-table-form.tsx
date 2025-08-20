'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader, CirclePlus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addTable } from '@/services/tables-services';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import {
  CreateTablePayload,
  Table,
  FieldDefinition,
} from '@/types/tables-types';

interface CreateTableFormProps {
  directoryId: string;
  onClose: () => void;
  onCreate: (table: Table) => void;
}

export default function CreateTableForm({
  directoryId,
  onClose,
  onCreate,
}: CreateTableFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([
    {
      id: Date.now().toString(),
      label: '',
      key: '',
      type: 'text',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const generateKeyFromLabel = (label: string) =>
    label.trim().toLowerCase().replace(/\s+/g, '_');

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { id: Date.now().toString(), label: '', key: '', type: 'text' },
    ]);
  };

  const updateField = (
    index: number,
    field: Partial<FieldDefinition>
  ) => {
    setFields((prev) => {
      const newFields = [...prev];
      if (field.label !== undefined) {
        newFields[index] = {
          ...newFields[index],
          label: field.label,
          key: generateKeyFromLabel(field.label),
        };
      } else {
        newFields[index] = { ...newFields[index], ...field };
      }
      return newFields;
    });
  };

  const removeField = (index: number) => {
    if (fields.length === 1) return;
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Table name is required.');
      return;
    }
    if (fields[0].label.trim() === '') {
      setError('The primary field definition is required.');
      return;
    }
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const validFields = fields.filter(
        (field, i) => i === 0 || field.label.trim() !== ''
      );
      const payload: CreateTablePayload = {
        name: name.trim(),
        description: description.trim(),
        fieldDefinitions: validFields,
      };

      const newTableId = await addTable(
        user.uid,
        directoryId,
        payload
      );
      onCreate({
        id: newTableId,
        name: payload.name,
        description: payload.description,
        fieldDefinitions: payload.fieldDefinitions,
        createdAt: new Date(),
      });
      toast({ title: 'Table added successfully.' });
      onClose();
    } catch (error) {
      console.error('Error creating table:', error);
      setError('Could not create table. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 mb-2">{error}</div>
      )}

      <Label className="block text-sm font-medium text-muted-foreground">
        Table Title
      </Label>
      <Input
        placeholder="Table Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-2 w-full"
      />

      <Label className="block text-sm font-medium text-muted-foreground mt-4">
        Description (optional)
      </Label>
      <Textarea
        placeholder="Table Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2 w-full"
      />

      <div className="mt-4">
        <Label className="block text-sm font-medium text-muted-foreground">
          Dynamic Field Definitions (one field required, others
          optional)
        </Label>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative flex items-center gap-2 border border-border p-3 rounded-lg mt-2 hover:shadow-sm transition-shadow"
          >
            <Input
              placeholder="Field Label (e.g., Title)"
              value={field.label}
              onChange={(e) =>
                updateField(index, { label: e.target.value })
              }
              className="flex-1"
            />
            <Select
              value={field.type}
              onValueChange={(value) =>
                updateField(index, {
                  type: value as FieldDefinition['type'],
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date (Calendar)</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
            {fields.length > 1 && (
              <button
                onClick={() => removeField(index)}
                aria-label="Remove field"
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addField}
          className="mt-2 w-full"
        >
          <CirclePlus size={16} className="mr-2" />
          Add Field
        </Button>
      </div>

      <Button
        onClick={handleSubmit}
        className="mt-4 w-full"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader size={16} className="animate-spin" />
            Creating...
          </div>
        ) : (
          'Create Table'
        )}
      </Button>
    </div>
  );
}

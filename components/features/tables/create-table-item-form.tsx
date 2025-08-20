'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Loader } from 'lucide-react';
import { addTableItem } from '@/services/tables-services';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import {
  CreateTableItemPayload,
  FieldDefinition,
} from '@/types/tables-types';
import { CheckCircle, Circle } from 'lucide-react';
import { ColorThemeProvider } from '@/providers/color-theme-provider';

interface CreateTableItemFormProps {
  directoryId: string;
  tableId: string;
  fieldDefinitions: FieldDefinition[];
  onCreate: (payload: CreateTableItemPayload) => void;
  onClose: () => void;
}

export default function CreateTableItemForm({
  directoryId,
  tableId,
  fieldDefinitions,
  onCreate,
  onClose,
}: CreateTableItemFormProps) {
  const [fieldData, setFieldData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleDateChange = (key: string, date: Date | undefined) => {
    setFieldData((prev) => ({
      ...prev,
      [key]: date || null,
    }));
  };

  const handleChange = (key: string, value: any) => {
    setFieldData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const hasAtLeastOneValue = Object.values(fieldData).some(
      (val) => val !== '' && val !== null && val !== undefined
    );

    if (!hasAtLeastOneValue) {
      setError('Please enter at least one field value.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payloadData: Record<string, any> = {};
      fieldDefinitions.forEach((field) => {
        if (field.type === 'date') {
          const dateVal = fieldData[field.key];
          payloadData[field.key] = dateVal
            ? dateVal.toISOString()
            : '';
        } else {
          payloadData[field.key] = fieldData[field.key] || '';
        }
      });

      const payload: CreateTableItemPayload = {
        data: payloadData,
      };

      await addTableItem(user.uid, directoryId, tableId, payload);

      onCreate(payload);
      toast({ title: 'Item added successfully.' });
      onClose();
    } catch (err) {
      console.error('Error adding table item:', err);
      setError('Could not add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="text-sm text-red-600 mb-3">{error}</div>
      )}

      {fieldDefinitions.map((field) => {
        if (field.type === 'date') {
          const selectedDate = fieldData[field.key] || null;
          return (
            <div key={field.id} className="mb-4">
              <Label className="block text-sm font-medium text-muted-foreground">
                {field.label || field.key}
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-2 w-full justify-start text-left font-normal"
                  >
                    {selectedDate
                      ? format(selectedDate, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      handleDateChange(field.key, date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          );
        }

        if (field.type === 'text') {
          return (
            <div key={field.id} className="mb-4">
              <Label className="block text-sm font-medium text-muted-foreground">
                {field.label || field.key}
              </Label>
              <Input
                value={fieldData[field.key] || ''}
                onChange={(e) =>
                  handleChange(field.key, e.target.value)
                }
                className="mt-2"
              />
            </div>
          );
        }

        if (field.type === 'number') {
          return (
            <div key={field.id} className="mb-4">
              <Label className="block text-sm font-medium text-muted-foreground">
                {field.label || field.key}
              </Label>
              <Input
                type="number"
                value={fieldData[field.key] || ''}
                onChange={(e) =>
                  handleChange(field.key, e.target.value)
                }
                className="mt-2"
              />
            </div>
          );
        }

        if (field.type === 'link') {
          return (
            <div key={field.id} className="mb-4">
              <Label className="block text-sm font-medium text-muted-foreground">
                {field.label || field.key}
              </Label>
              <Input
                type="url"
                value={fieldData[field.key] || ''}
                onChange={(e) =>
                  handleChange(field.key, e.target.value)
                }
                className="mt-2"
              />
            </div>
          );
        }

        if (field.type === 'boolean') {
          return (
            <div key={field.id} className=" my-4">
              <ColorThemeProvider className="w-full flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground">
                  {field.label || field.key}
                </Label>
                <button
                  onClick={() =>
                    handleChange(field.key, !fieldData[field.key])
                  }
                  className="focus:outline-none"
                  aria-label={
                    fieldData[field.key]
                      ? 'Set to false'
                      : 'Set to true'
                  }
                >
                  {fieldData[field.key] ? (
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
              </ColorThemeProvider>
            </div>
          );
        }

        return (
          <div key={field.id} className="mb-4 mt-2">
            <Label className="block text-sm font-medium text-muted-foreground">
              {field.label || field.key}
            </Label>
            <Textarea
              value={fieldData[field.key] || ''}
              onChange={(e) =>
                handleChange(field.key, e.target.value)
              }
              className="mt-2"
            />
          </div>
        );
      })}

      <Button
        onClick={handleSubmit}
        className="w-full mt-4"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader size={16} className="animate-spin" />
            Adding...
          </div>
        ) : (
          'Add Item'
        )}
      </Button>
    </div>
  );
}

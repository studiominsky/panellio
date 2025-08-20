'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Place } from '@/types/place-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditPlaceFormProps {
  initialPlace: Place;
  onSave: (updatedPlace: Place) => void;
  onClose: () => void;
  groups: { id: string; name: string }[];
}

export default function EditPlaceForm({
  initialPlace,
  onSave,
  onClose,
  groups,
}: EditPlaceFormProps) {
  const [name, setName] = useState(initialPlace.name);
  const [description, setDescription] = useState(
    initialPlace.description
  );
  const [latitude, setLatitude] = useState<number>(
    initialPlace.latitude
  );
  const [longitude, setLongitude] = useState<number>(
    initialPlace.longitude
  );
  const [geoError, setGeoError] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialPlace.groupId || 'none'
  );

  const handleSubmit = () => {
    if (!name) return;
    if (latitude === null || longitude === null) {
      setGeoError(
        'Please provide coordinates or geocode an address.'
      );
      return;
    }
    const updatedPlace: Place = {
      ...initialPlace,
      name,
      description,
      latitude,
      longitude,
      ...(selectedGroupId && selectedGroupId !== 'none'
        ? { groupId: selectedGroupId }
        : { groupId: undefined }),
    };
    onSave(updatedPlace);
    onClose();
  };

  return (
    <div>
      <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
        Name
      </Label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter place name"
      />

      <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
        Description
      </Label>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter description"
      />

      <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
        Latitude
      </Label>
      <Input
        type="number"
        value={latitude}
        onChange={(e) => setLatitude(Number(e.target.value))}
      />

      <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
        Longitude
      </Label>
      <Input
        type="number"
        value={longitude}
        onChange={(e) => setLongitude(Number(e.target.value))}
      />

      {geoError && <p className="text-sm text-red-500">{geoError}</p>}

      <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
        Group (optional)
      </Label>
      <Select
        value={selectedGroupId}
        onValueChange={setSelectedGroupId}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Ungrouped" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Ungrouped</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button className="w-full mt-6" onClick={handleSubmit}>
        Save Changes
      </Button>
    </div>
  );
}

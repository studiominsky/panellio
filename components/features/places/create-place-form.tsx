'use client';

import React, { useState, useEffect } from 'react';
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
interface CreatePlaceFormProps {
  onCreate: (place: Place) => void;
  onClose: () => void;
  initialLatitude?: number;
  initialLongitude?: number;
  groups: { id: string; name: string }[];
}

export default function CreatePlaceForm({
  onCreate,
  onClose,
  initialLatitude,
  initialLongitude,
  groups,
}: CreatePlaceFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(
    initialLatitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    initialLongitude ?? null
  );
  const [geoError, setGeoError] = useState('');
  const [selectedGroupId, setSelectedGroupId] =
    useState<string>('none');

  const [showNavigation, setShowNavigation] =
    useState<boolean>(false);
  const [showGeocoder, setShowGeocoder] = useState<boolean>(false);

  useEffect(() => {
    if (typeof initialLatitude === 'number')
      setLatitude(initialLatitude);
    if (typeof initialLongitude === 'number')
      setLongitude(initialLongitude);
  }, [initialLatitude, initialLongitude]);

  const handleSubmit = () => {
    if (!name) return;
    if (latitude === null || longitude === null) {
      setGeoError(
        'Please provide coordinates or geocode an address.'
      );
      return;
    }
    const newPlace: Place = {
      id: Date.now().toString(),
      name,
      description,
      latitude,
      longitude,
      ...(selectedGroupId !== 'none'
        ? { groupId: selectedGroupId }
        : { groupId: undefined }),
      ...(showNavigation ? { showNavigation } : {}),
      ...(showGeocoder ? { showGeocoder } : {}),
    };
    onCreate(newPlace);
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

      {latitude !== null && longitude !== null && (
        <div className="text-sm my-4 text-foreground/80">
          Coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </div>
      )}
      {geoError && <p className="text-sm text-red-500">{geoError}</p>}

      <Button className="w-full mt-4" onClick={handleSubmit}>
        Create Place
      </Button>
    </div>
  );
}

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface EditMapOptionsFormProps {
  showNavigation: boolean;
  showGeocoder: boolean;
  onChangeNavigation: (value: boolean) => void;
  onChangeGeocoder: (value: boolean) => void;
  onClose: () => void;
}

export default function EditMapOptionsForm({
  showNavigation,
  showGeocoder,
  onChangeNavigation,
  onChangeGeocoder,
  onClose,
}: EditMapOptionsFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showNavigation}
          onChange={(e) => onChangeNavigation(e.target.checked)}
          id="navigation-checkbox"
        />
        <Label htmlFor="navigation-checkbox">
          Show Mapbox Navigation
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showGeocoder}
          onChange={(e) => onChangeGeocoder(e.target.checked)}
          id="geocoder-checkbox"
        />
        <Label htmlFor="geocoder-checkbox">
          Show Mapbox Geocoder
        </Label>
      </div>
      <Button onClick={onClose}>Save Options</Button>
    </div>
  );
}

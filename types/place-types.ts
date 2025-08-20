export interface Place {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface MapOptions {
  showPlaces: boolean;
  showNavigation: boolean;
  showGeocoder: boolean;
}

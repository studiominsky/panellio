'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useTheme } from 'next-themes';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarShortcut,
} from '@/components/ui/menubar';
import {
  Compass,
  Ellipsis,
  Minus,
  Plus,
  Trash2,
  Maximize2,
  Fullscreen,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { deleteField } from 'firebase/firestore';

import {
  addPlace,
  updatePlace,
  deletePlace,
  deleteAllPlaces,
  getPlaces,
  addGroup,
  getGroups,
  getMapOptions,
  updateMapOptions,
  MapOptions,
  deleteGroup,
  updateGroup,
} from '@/services/places-services';
import CreatePlaceForm from './create-place-form';
import EditPlaceForm from './edit-place-form';
import CreateGroupForm from './create-group-form';

import Map, {
  Marker,
  Popup,
  MapRef,
  MapMouseEvent,
} from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { Badge } from '@/components/ui/badge';
import { Place, Group } from '@/types/place-types';
import dynamic from 'next/dynamic';
import { DirectoryItem } from '@/types/directory-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SearchBoxDynamic = dynamic(
  () =>
    import('@mapbox/search-js-react').then(
      (mod) => mod.SearchBox as any
    ),
  { ssr: false }
) as React.ComponentType<any>;

import 'mapbox-gl/dist/mapbox-gl.css';

interface PlacesFeatureProps {
  width: number;
  height: number;
  mapRefreshKey: number;
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
}

const CustomNavigationControl = ({
  mapRef,
}: {
  mapRef: React.RefObject<MapRef>;
}) => {
  const handleZoomIn = () => {
    mapRef.current?.getMap().zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.getMap().zoomOut();
  };

  const handleResetNorth = () => {
    mapRef.current?.getMap().rotateTo(0);
  };

  return (
    <div className="custom-navigation-control">
      <button
        onClick={handleZoomIn}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        aria-label="Zoom In"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={handleZoomOut}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        aria-label="Zoom Out"
      >
        <Minus size={16} />
      </button>
      <button
        onClick={handleResetNorth}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        aria-label="Reset North"
      >
        <Compass size={16} />
      </button>
    </div>
  );
};

export default function PlacesFeature({
  width,
  height,
  mapRefreshKey,
  directoryId,
  itemData,
  onDirectoryItemRemoved,
}: PlacesFeatureProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRemovePlacesDialogOpen, setIsRemovePlacesDialogOpen] =
    useState(false);
  const mapRef = useRef<MapRef>(null);
  const fullscreenMapRef = useRef<MapRef>(null);
  const mapInstance = useRef<any>(null);

  const canLoadPlaces = user && directoryId;

  const styleUrl =
    theme === 'light'
      ? 'mapbox://styles/nenadmarinkovic/cm78wb4p501r101sd7jxgf0je'
      : 'mapbox://styles/nenadmarinkovic/cm73yi6co005401r89x9g0mdk';

  const customTheme = {
    variables: {
      borderRadius: '0.5rem',
      colorBackground: 'hsl(var(--card))',
      colorText: 'hsl(var(--foreground))',
    },
    icons: {
      search: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="searchbox-icon">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      `,
      close: false,
    },
  };

  const [places, setPlaces] = useState<Place[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(
    null
  );
  const [isCreatePlaceDialogOpen, setIsCreatePlaceDialogOpen] =
    useState(false);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] =
    useState(false);
  const [isEditPlaceDialogOpen, setIsEditPlaceDialogOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [draftCoords, setDraftCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [mapOptions, setMapOptions] = useState<MapOptions | null>(
    null
  );

  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] =
    useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  const DEFAULT_LONGITUDE = 16.3738;
  const DEFAULT_LATITUDE = 48.2082;

  const [viewState, setViewState] = useState({
    longitude: DEFAULT_LONGITUDE,
    latitude: DEFAULT_LATITUDE,
    zoom: 16,
    pitch: 75,
    bearing: 0,
  });

  useEffect(() => {
    const fetchUserLocationCoords = async () => {
      if (!user?.location) {
        setViewState((prev) => ({
          ...prev,
          longitude: DEFAULT_LONGITUDE,
          latitude: DEFAULT_LATITUDE,
        }));
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            user.location
          )}.json?access_token=${
            process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          }`
        );
        if (!response.ok) throw new Error('Geocoding failed');
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setViewState((prev) => ({
            ...prev,
            longitude: lng,
            latitude: lat,
          }));
        } else {
          setViewState((prev) => ({
            ...prev,
            longitude: DEFAULT_LONGITUDE,
            latitude: DEFAULT_LATITUDE,
          }));
        }
      } catch (error) {
        console.error('Error geocoding user location:', error);
        setViewState((prev) => ({
          ...prev,
          longitude: DEFAULT_LONGITUDE,
          latitude: DEFAULT_LATITUDE,
        }));
      }
    };

    fetchUserLocationCoords();
  }, [user?.location]);

  const handleEditGroup = (group: Group) => {
    setGroupToEdit(group);
    setNewGroupName(group.name);
    setIsEditGroupDialogOpen(true);
  };

  const handleSaveGroupEdits = async () => {
    if (!groupToEdit || !user || !directoryId) return;
    try {
      await updateGroup(user.uid, directoryId, groupToEdit.id, {
        name: newGroupName,
      });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupToEdit.id ? { ...g, name: newGroupName } : g
        )
      );
      toast({ title: 'Group updated successfully.' });
      setIsEditGroupDialogOpen(false);
      setGroupToEdit(null);
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to update group.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!canLoadPlaces) return;
    const fetchOptions = async () => {
      try {
        const opts = await getMapOptions(user!.uid, directoryId);
        setMapOptions(opts);
      } catch (error) {
        console.error('Error fetching map options:', error);
      }
    };
    fetchOptions();
  }, [user, directoryId, canLoadPlaces]);

  useEffect(() => {
    if (!mapOptions || !user || !directoryId) return;
    updateMapOptions(user.uid, directoryId, mapOptions).catch(
      (error) => console.error('Error updating map options:', error)
    );
  }, [mapOptions, user, directoryId]);

  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    requestAnimationFrame(() => {
      mapRef.current?.resize();
    });
  }, [width, height]);

  useEffect(() => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        mapRef.current?.resize();
      });
    }, 100);
  }, [pathname, searchParams]);

  useEffect(() => {
    requestAnimationFrame(() => {
      mapRef.current?.resize();
    });
  }, [mapRefreshKey]);

  useEffect(() => {
    if (!canLoadPlaces) return;
    const fetchData = async () => {
      try {
        const [fetchedPlaces, fetchedGroups] = await Promise.all([
          getPlaces(user!.uid, directoryId),
          getGroups(user!.uid, directoryId),
        ]);
        setPlaces(fetchedPlaces);
        setGroups(fetchedGroups);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user, directoryId, canLoadPlaces]);

  const handleCreatePlace = async (newPlace: Place) => {
    if (!user || !directoryId) return;
    try {
      const placeData = {
        name: newPlace.name,
        description: newPlace.description,
        latitude: newPlace.latitude,
        longitude: newPlace.longitude,
        ...(newPlace.groupId ? { groupId: newPlace.groupId } : {}),
      };
      const newPlaceId = await addPlace(
        user.uid,
        directoryId,
        placeData
      );
      const placeWithId = {
        ...newPlace,
        id: newPlaceId,
        groupId: newPlace.groupId ? newPlace.groupId : undefined,
      };
      setPlaces((prev) => [...prev, placeWithId]);
      toast({ title: 'Place added successfully.' });
    } catch (error) {
      console.error('Error adding place:', error);
    }
  };

  const handleCreateGroup = async (groupName: string) => {
    if (!user || !directoryId) return;
    try {
      const groupData = { name: groupName };
      const newGroupId = await addGroup(
        user.uid,
        directoryId,
        groupData
      );
      const newGroup = { id: newGroupId, ...groupData };
      setGroups((prev) => [...prev, newGroup]);
      toast({ title: `Group "${groupName}" created successfully.` });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group.',
        variant: 'destructive',
      });
    }
  };

  const handleEditPlace = (place: Place) => {
    setSelectedPlace(place);
    setIsEditPlaceDialogOpen(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      if (!user) {
        toast({
          title: 'Error',
          description: 'User not authenticated.',
          variant: 'destructive',
        });
        return;
      }
      await deleteGroup(user.uid, directoryId, groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      toast({ title: 'Group deleted successfully.' });
    } catch (error) {
      console.error('Error deleting group', error);
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    }
  };

  const handleSavePlaceEdits = async (updatedPlace: Place) => {
    if (!user || !directoryId) return;
    try {
      await updatePlace(user.uid, directoryId, updatedPlace.id, {
        name: updatedPlace.name,
        description: updatedPlace.description,
        latitude: updatedPlace.latitude,
        longitude: updatedPlace.longitude,
        ...(updatedPlace.groupId
          ? { groupId: updatedPlace.groupId }
          : {
              groupId: deleteField() as unknown as string | undefined,
            }),
      });
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === updatedPlace.id
            ? {
                ...updatedPlace,
                groupId: updatedPlace.groupId || undefined,
              }
            : p
        )
      );
      toast({ title: 'Place updated successfully.' });
    } catch (error) {
      console.error('Error updating place:', error);
    } finally {
      setIsEditPlaceDialogOpen(false);
      setSelectedPlace(null);
    }
  };

  const handleDeletePlace = async (place: Place) => {
    if (!user || !directoryId) return;
    try {
      await deletePlace(user.uid, directoryId, place.id);
      setPlaces((prev) => prev.filter((p) => p.id !== place.id));
      toast({ title: 'Place deleted successfully.' });
      setSelectedPlace(null);
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  const handleRemoveAllPlaces = async () => {
    if (!user || !directoryId) return;
    const previousPlaces = places;
    setPlaces([]);
    setIsRemoving(true);
    try {
      await deleteAllPlaces(user.uid, directoryId);
      toast({ title: 'All places removed.' });
      onDirectoryItemRemoved(itemData.id);
    } catch (error) {
      console.error('Error removing all places:', error);
      setPlaces(previousPlaces);
      toast({
        title: 'Error removing places.',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    mapInstance.current = map;
    setIsMapReady(true);
    if (!map.getLayer('3d-buildings')) {
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 17,
        maxzoom: 15,
        paint: {
          'fill-extrusion-color': 'hsl(210, 40%, 96.1%)',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height'],
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height'],
          ],
          'fill-extrusion-opacity': 1,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (isMapReady && selectedPlace && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedPlace.longitude, selectedPlace.latitude],
        zoom: 16,
        speed: 1.2,
        curve: 1.4,
      });
    }
  }, [isMapReady, selectedPlace]);

  useEffect(() => {
    if (!isFullscreen && selectedPlace && mapRef.current) {
      setTimeout(() => {
        const map = mapRef.current?.getMap();
        if (map) {
          map.flyTo({
            center: [selectedPlace.longitude, selectedPlace.latitude],
            zoom: 16,
            speed: 1.2,
            curve: 1.4,
          });
        }
      }, 200);
    }
  }, [isFullscreen, selectedPlace]);

  const handleMarkerClick = useCallback((place: Place, e: any) => {
    e.originalEvent.stopPropagation();
    setSelectedPlace(place);
    setActiveTab(place.id);
  }, []);

  const handleMapDblClick = useCallback((evt: MapMouseEvent) => {
    evt.preventDefault();
    const { lat, lng } = evt.lngLat;
    setDraftCoords({ lat, lng });
    setIsCreatePlaceDialogOpen(true);
  }, []);

  const groupedPlaces = useMemo(() => {
    const map: { [key: string]: Place[] } = {};
    places.forEach((place) => {
      if (place.groupId) {
        if (!map[place.groupId]) map[place.groupId] = [];
        map[place.groupId].push(place);
      }
    });
    return map;
  }, [places]);

  const ungroupedPlaces = useMemo(() => {
    return places.filter((place) => !place.groupId);
  }, [places]);

  return (
    <div
      style={{ height: 'calc(100% - 2rem)', position: 'relative' }}
    >
      {/* Main Menubar */}
      <Menubar className="directory-item-drag-handle cursor-grab flex py-4 justify-end items-center bg-muted border border-border rounded-t-xl">
        <MenubarMenu>
          <MenubarTrigger
            className="bg-muted h-4 p-0 absolute right-6"
            variant="ellipsis"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => setIsCreatePlaceDialogOpen(true)}
            >
              Add Place
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              onClick={() => setIsCreateGroupDialogOpen(true)}
            >
              Add Group
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Show on Map</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarCheckboxItem
                  checked={mapOptions?.showPlaces ?? true}
                  onCheckedChange={(val: boolean) =>
                    setMapOptions((prev) => ({
                      showPlaces: val,
                      showNavigation: prev?.showNavigation ?? false,
                      showGeocoder: prev?.showGeocoder ?? false,
                    }))
                  }
                >
                  Show Places
                </MenubarCheckboxItem>
                <MenubarCheckboxItem
                  checked={mapOptions?.showNavigation ?? false}
                  onCheckedChange={(val: boolean) =>
                    setMapOptions((prev) => ({
                      showPlaces: prev?.showPlaces ?? true,
                      showNavigation: val,
                      showGeocoder: prev?.showGeocoder ?? false,
                    }))
                  }
                >
                  Show Navigation
                </MenubarCheckboxItem>
                <MenubarCheckboxItem
                  checked={mapOptions?.showGeocoder ?? false}
                  onCheckedChange={(val: boolean) =>
                    setMapOptions((prev) => ({
                      showPlaces: prev?.showPlaces ?? true,
                      showNavigation: prev?.showNavigation ?? false,
                      showGeocoder: val,
                    }))
                  }
                >
                  Show Search
                </MenubarCheckboxItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={() => setIsFullscreen(true)}>
              Fullscreen
              <MenubarShortcut>
                <Maximize2 size={14} />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              onClick={() => setIsRemovePlacesDialogOpen(true)}
              variant="destructive"
            >
              Remove Places
              <MenubarShortcut>
                <Trash2 className="text-destructive" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <Dialog
        open={isFullscreen}
        onOpenChange={(open) => {
          setIsFullscreen(open);
          if (!open && selectedPlace) {
            setTimeout(() => {
              const map = fullscreenMapRef.current?.getMap();
              if (map) {
                map.flyTo({
                  center: [
                    selectedPlace.longitude,
                    selectedPlace.latitude,
                  ],
                  zoom: 16,
                  speed: 1.2,
                  curve: 1.4,
                });
              }
            }, 100);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="min-w-[90%] min-h-[80%] p-0"
          style={{ height: '90vh' }}
        >
          <div className="flex flex-col h-full">
            <div>
              <Menubar className="flex py-4 justify-end items-center bg-muted">
                <MenubarMenu>
                  <MenubarTrigger
                    className="bg-muted h-4 p-0 absolute right-6"
                    variant="ellipsis"
                  >
                    <Ellipsis size={23} />
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem
                      onClick={() => setIsCreatePlaceDialogOpen(true)}
                    >
                      Add Place
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem
                      onClick={() => setIsCreateGroupDialogOpen(true)}
                    >
                      Add Group
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                      <MenubarSubTrigger>
                        Show on Map
                      </MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarCheckboxItem
                          checked={mapOptions?.showPlaces ?? true}
                          onCheckedChange={(val: boolean) =>
                            setMapOptions((prev) => ({
                              showPlaces: val,
                              showNavigation:
                                prev?.showNavigation ?? false,
                              showGeocoder:
                                prev?.showGeocoder ?? false,
                            }))
                          }
                        >
                          Show Places
                        </MenubarCheckboxItem>
                        <MenubarCheckboxItem
                          checked={
                            mapOptions?.showNavigation ?? false
                          }
                          onCheckedChange={(val: boolean) =>
                            setMapOptions((prev) => ({
                              showPlaces: prev?.showPlaces ?? true,
                              showNavigation: val,
                              showGeocoder:
                                prev?.showGeocoder ?? false,
                            }))
                          }
                        >
                          Show Navigation
                        </MenubarCheckboxItem>
                        <MenubarCheckboxItem
                          checked={mapOptions?.showGeocoder ?? false}
                          onCheckedChange={(val: boolean) =>
                            setMapOptions((prev) => ({
                              showPlaces: prev?.showPlaces ?? true,
                              showNavigation:
                                prev?.showNavigation ?? false,
                              showGeocoder: val,
                            }))
                          }
                        >
                          Show Search
                        </MenubarCheckboxItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem
                      onClick={() => setIsFullscreen(false)}
                    >
                      Exit Fullscreen
                      <MenubarShortcut>
                        <Maximize2 size={14} />
                      </MenubarShortcut>
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>

            <div className="flex flex-grow rounded-t-xl">
              {mapOptions?.showPlaces && (
                <div
                  style={{ height: 'calc(100% - 32px)' }}
                  className="p-4 w-[350px] h-[100%] absolute left-0 z-30 bg-card border-r overflow-hidden border-border"
                >
                  {groups.map((group) => {
                    const placesInGroup =
                      groupedPlaces[group.id] || [];
                    return (
                      <div key={group.id} className="pb-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-start max-w-[70%]">
                            {group.name}
                          </span>
                          <Menubar className="flex">
                            <MenubarMenu>
                              <MenubarTrigger
                                variant="ghost"
                                className="p-1 h-0 px-0"
                              >
                                <Ellipsis size={16} />
                              </MenubarTrigger>
                              <MenubarContent>
                                <MenubarItem
                                  onClick={() =>
                                    handleEditGroup(group)
                                  }
                                >
                                  Edit Name
                                </MenubarItem>
                                <MenubarSeparator />
                                <MenubarItem
                                  onClick={() =>
                                    handleDeleteGroup(group.id)
                                  }
                                  variant="destructive"
                                >
                                  Delete Group
                                  <MenubarShortcut>
                                    <Trash2
                                      size={16}
                                      className="text-red-500"
                                    />
                                  </MenubarShortcut>
                                </MenubarItem>
                              </MenubarContent>
                            </MenubarMenu>
                          </Menubar>
                        </div>

                        {/* List of Places in the Group */}
                        <div>
                          {placesInGroup.length > 0 ? (
                            placesInGroup.map((place) => (
                              <div
                                key={place.id}
                                className="flex items-center justify-between my-3"
                              >
                                <span
                                  className={`cursor-pointer text-sm ${
                                    activeTab === place.id
                                      ? 'text-foreground/100 font-medium'
                                      : 'text-foreground/70'
                                  }`}
                                  onClick={() => {
                                    setSelectedPlace(place);
                                    setActiveTab(place.id);
                                  }}
                                >
                                  {place.name || 'Untitled Place'}
                                </span>
                                <Menubar>
                                  <MenubarMenu>
                                    <MenubarTrigger
                                      variant="ghost"
                                      className="p-1 h-0 px-0"
                                    >
                                      <Ellipsis size={16} />
                                    </MenubarTrigger>
                                    <MenubarContent>
                                      <MenubarItem
                                        onClick={() =>
                                          handleEditPlace(place)
                                        }
                                      >
                                        Edit
                                      </MenubarItem>
                                      <MenubarItem
                                        onClick={() =>
                                          handleDeletePlace(place)
                                        }
                                      >
                                        Delete
                                      </MenubarItem>
                                    </MenubarContent>
                                  </MenubarMenu>
                                </Menubar>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-start text-muted-foreground py-2">
                              No places in this group.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Optionally, render ungrouped places below */}
                  {ungroupedPlaces.length > 0 && (
                    <div>
                      {ungroupedPlaces.map((place) => (
                        <div
                          key={place.id}
                          className="flex items-center justify-between my-3 rounded gap-3"
                        >
                          <span
                            className={`cursor-pointer text-sm ${
                              activeTab === place.id
                                ? 'text-foreground/100 font-medium'
                                : 'text-foreground/70'
                            }`}
                            onClick={() => {
                              setSelectedPlace(place);
                              setActiveTab(place.id);
                            }}
                          >
                            {place.name || 'Untitled Place'}
                          </span>
                          <Menubar>
                            <MenubarMenu>
                              <MenubarTrigger
                                variant="ghost"
                                className="p-1 h-0 px-0"
                              >
                                <Ellipsis size={16} />
                              </MenubarTrigger>
                              <MenubarContent>
                                <MenubarItem
                                  onClick={() =>
                                    handleEditPlace(place)
                                  }
                                >
                                  Edit
                                </MenubarItem>
                                <MenubarSeparator />
                                <MenubarItem
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeletePlace(place)
                                  }
                                >
                                  Delete
                                  <MenubarShortcut>
                                    <Trash2
                                      size={16}
                                      className="text-red-500"
                                    />
                                  </MenubarShortcut>
                                </MenubarItem>
                              </MenubarContent>
                            </MenubarMenu>
                          </Menubar>
                        </div>
                      ))}
                    </div>
                  )}

                  {places.length === 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground py-2 pt-6 flex flex-wrap gap-8">
                        No places added yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Map Container */}
              <div className="flex-grow relative">
                <Map
                  ref={fullscreenMapRef}
                  {...viewState}
                  onMove={(evt) => setViewState(evt.viewState)}
                  mapStyle={styleUrl}
                  mapboxAccessToken={
                    process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                  }
                  style={{ width: '100%', height: '100%' }}
                  onLoad={handleMapLoad}
                  onDblClick={handleMapDblClick}
                >
                  {places.map((place) => (
                    <Marker
                      key={place.id}
                      longitude={place.longitude}
                      latitude={place.latitude}
                      anchor="bottom"
                      onClick={(e) => handleMarkerClick(place, e)}
                    >
                      <div style={{ cursor: 'pointer' }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="var(--ui-primary)"
                          stroke="var(--ui-primary)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                    </Marker>
                  ))}
                  {selectedPlace && (
                    <Popup
                      longitude={selectedPlace.longitude}
                      latitude={selectedPlace.latitude}
                      onClose={() => setSelectedPlace(null)}
                      anchor="bottom"
                    >
                      <div className="bg-card flex flex-col gap-2 rounded-md p-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-sm">
                            {selectedPlace.name}
                          </h3>
                          <Menubar>
                            <MenubarMenu>
                              <MenubarTrigger
                                className="px-0 py-0 absolute top-2 right-2 h-0"
                                variant="ellipsis"
                              >
                                <Ellipsis size={16} />
                              </MenubarTrigger>
                              <MenubarContent>
                                <MenubarItem
                                  onClick={() =>
                                    handleEditPlace(selectedPlace)
                                  }
                                >
                                  Edit
                                </MenubarItem>
                                <MenubarItem
                                  onClick={() =>
                                    handleDeletePlace(selectedPlace)
                                  }
                                >
                                  Delete
                                </MenubarItem>
                              </MenubarContent>
                            </MenubarMenu>
                          </Menubar>
                        </div>
                        {selectedPlace.description && (
                          <p className="text-start py-3 text-sm">
                            {selectedPlace.description}
                          </p>
                        )}
                        <Badge
                          variant="outline"
                          className="mb-1 py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
                        >
                          {selectedPlace.groupId
                            ? groups.find(
                                (group) =>
                                  group.id === selectedPlace.groupId
                              )?.name
                            : 'No Group'}
                        </Badge>
                      </div>
                    </Popup>
                  )}
                  {mapOptions?.showNavigation && (
                    <CustomNavigationControl mapRef={mapRef} />
                  )}
                  {mapOptions?.showGeocoder && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1,
                        width: '50%',
                        textAlign: 'start',
                      }}
                    >
                      {SearchBoxDynamic && (
                        <SearchBoxDynamic
                          accessToken={
                            process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
                          }
                          map={mapRef.current?.getMap()}
                          mapboxgl={mapboxgl}
                          value={searchValue}
                          onChange={(val: string) =>
                            setSearchValue(val)
                          }
                          marker={false}
                          placeholder="Search for places..."
                          theme={customTheme}
                        />
                      )}
                    </div>
                  )}
                </Map>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {mapOptions?.showPlaces && (
        <div className="p-4 w-[200px] min-h-[120px] absolute left-0 z-30 bg-card border-border border-l border-b border-r rounded-br-md overflow-auto max-h-[75%]">
          {groups.map((group) => {
            const placesInGroup = groupedPlaces[group.id] || [];
            return (
              <div key={group.id} className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-start max-w-[70%]">
                    {group.name}
                  </span>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger
                        variant="ghost"
                        className="p-1 h-0 px-0"
                      >
                        <Ellipsis size={16} />
                      </MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem
                          onClick={() => handleEditGroup(group)}
                        >
                          Edit Name
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem
                          onClick={() => handleDeleteGroup(group.id)}
                          variant="destructive"
                        >
                          Delete Group
                          <MenubarShortcut>
                            <Trash2
                              size={16}
                              className="text-red-500"
                            />
                          </MenubarShortcut>
                        </MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </div>

                <div>
                  {placesInGroup.length > 0 ? (
                    placesInGroup.map((place) => (
                      <div
                        key={place.id}
                        className="flex items-center justify-between my-2"
                      >
                        <span
                          className={`cursor-pointer text-sm ${
                            activeTab === place.id
                              ? 'text-foreground/100 font-medium'
                              : 'text-foreground/70'
                          }`}
                          onClick={() => {
                            setSelectedPlace(place);
                            setActiveTab(place.id);
                          }}
                        >
                          {place.name || 'Untitled Place'}
                        </span>
                        <Menubar>
                          <MenubarMenu>
                            <MenubarTrigger
                              variant="ghost"
                              className="p-1 h-0 px-0"
                            >
                              <Ellipsis size={16} />
                            </MenubarTrigger>
                            <MenubarContent>
                              <MenubarItem
                                onClick={() => handleEditPlace(place)}
                              >
                                Edit
                              </MenubarItem>
                              <MenubarItem
                                onClick={() =>
                                  handleDeletePlace(place)
                                }
                              >
                                Delete
                              </MenubarItem>
                            </MenubarContent>
                          </MenubarMenu>
                        </Menubar>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-start text-muted-foreground py-2">
                      No places in this group.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {ungroupedPlaces.length > 0 && (
            <div>
              {ungroupedPlaces.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between my-3 rounded gap-3"
                >
                  <span
                    className={`cursor-pointer text-sm ${
                      activeTab === place.id
                        ? 'text-foreground/100 font-medium'
                        : 'text-foreground/70'
                    }`}
                    onClick={() => {
                      setSelectedPlace(place);
                      setActiveTab(place.id);
                    }}
                  >
                    {place.name || 'Untitled Place'}
                  </span>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger
                        variant="ghost"
                        className="p-1 h-0 px-0"
                      >
                        <Ellipsis size={16} />
                      </MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem
                          onClick={() => handleEditPlace(place)}
                        >
                          Edit
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem
                          variant="destructive"
                          onClick={() => handleDeletePlace(place)}
                        >
                          Delete
                          <MenubarShortcut>
                            <Trash2
                              size={16}
                              className="text-red-500"
                            />
                          </MenubarShortcut>
                        </MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </div>
              ))}
            </div>
          )}

          {places.length === 0 && (
            <div>
              <p className="text-sm text-muted-foreground py-2 pt-6 flex flex-wrap gap-8">
                No places added yet.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="relative w-full h-full border-border border-b border-l border-r">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={styleUrl}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          onLoad={handleMapLoad}
          onDblClick={handleMapDblClick}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              longitude={place.longitude}
              latitude={place.latitude}
              anchor="bottom"
              onClick={(e) => handleMarkerClick(place, e)}
            >
              <div style={{ cursor: 'pointer' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="var(--ui-primary)"
                  stroke="var(--ui-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </Marker>
          ))}
          {selectedPlace && (
            <Popup
              longitude={selectedPlace.longitude}
              latitude={selectedPlace.latitude}
              onClose={() => setSelectedPlace(null)}
              anchor="bottom"
            >
              <div className="bg-card flex flex-col gap-2 rounded-md p-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm">
                    {selectedPlace.name}
                  </h3>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger
                        className="px-0 py-0 absolute top-2 right-2 h-0"
                        variant="ellipsis"
                      >
                        <Ellipsis size={16} />
                      </MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem
                          onClick={() =>
                            handleEditPlace(selectedPlace)
                          }
                        >
                          Edit
                        </MenubarItem>
                        <MenubarItem
                          onClick={() =>
                            handleDeletePlace(selectedPlace)
                          }
                        >
                          Delete
                        </MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </div>
                {selectedPlace.description && (
                  <p className="text-start py-3 text-sm">
                    {selectedPlace.description}
                  </p>
                )}
                <Badge
                  variant="outline"
                  className="mb-1 py-1 w-fit mt-2 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
                >
                  {selectedPlace.groupId
                    ? groups.find(
                        (group) => group.id === selectedPlace.groupId
                      )?.name
                    : 'No Group'}
                </Badge>
              </div>
            </Popup>
          )}
          {mapOptions?.showNavigation && (
            <CustomNavigationControl mapRef={mapRef} />
          )}
          {mapOptions?.showGeocoder && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1,
                width: '50%',
                textAlign: 'start',
              }}
            >
              {SearchBoxDynamic && (
                <SearchBoxDynamic
                  accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                  map={mapRef.current?.getMap()}
                  mapboxgl={mapboxgl}
                  value={searchValue}
                  onChange={(val: string) => setSearchValue(val)}
                  marker={false}
                  placeholder="Search for places..."
                  theme={customTheme}
                />
              )}
            </div>
          )}
        </Map>
      </div>

      <Dialog
        open={isCreatePlaceDialogOpen}
        onOpenChange={(open) => {
          setIsCreatePlaceDialogOpen(open);
          if (!open) setDraftCoords(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Place</DialogTitle>
            <DialogDescription>
              Enter details for the new place.
            </DialogDescription>
          </DialogHeader>
          <CreatePlaceForm
            onCreate={handleCreatePlace}
            onClose={() => setIsCreatePlaceDialogOpen(false)}
            initialLatitude={draftCoords?.lat}
            initialLongitude={draftCoords?.lng}
            groups={groups}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditPlaceDialogOpen}
        onOpenChange={(open) => {
          setIsEditPlaceDialogOpen(open);
          if (!open) setSelectedPlace(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
            <DialogDescription>
              Update the details for this place.
            </DialogDescription>
          </DialogHeader>
          {selectedPlace && (
            <EditPlaceForm
              initialPlace={selectedPlace}
              groups={groups}
              onSave={handleSavePlaceEdits}
              onClose={() => setIsEditPlaceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateGroupDialogOpen}
        onOpenChange={(open) => setIsCreateGroupDialogOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Enter a name for your group.
            </DialogDescription>
          </DialogHeader>
          <CreateGroupForm
            onCreate={async (groupName) => {
              await handleCreateGroup(groupName);
              setIsCreateGroupDialogOpen(false);
            }}
            onClose={() => setIsCreateGroupDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRemovePlacesDialogOpen}
        onOpenChange={setIsRemovePlacesDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove All Places</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all places? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              onClick={() => setIsRemovePlacesDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveAllPlaces}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditGroupDialogOpen}
        onOpenChange={(open) => {
          setIsEditGroupDialogOpen(open);
          if (!open) setGroupToEdit(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group Name</DialogTitle>
            <DialogDescription>
              Update the name for this group.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="New Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="mt-4"
          />
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="primary"
              onClick={() => setIsEditGroupDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSaveGroupEdits}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

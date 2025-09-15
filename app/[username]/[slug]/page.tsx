'use client';

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Directory, DirectoryItem } from '@/types/directory-type';
import Ui from '@/containers/ui';
import DirectorySettings from '@/components/directory-settings';
import Footer from '@/components/footer';
import { toast } from '@/hooks/use-toast';
import {
  WidthProvider,
  Responsive,
  Layout,
  Layouts,
} from 'react-grid-layout';
import debounce from 'lodash/debounce';
import { directoryItemComponents } from '@/components/directory-item';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import '../../../styles/react-grid.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const findPosition = (
  items: DirectoryItem[],
  w: number,
  h: number,
  cols: number,
  rows: number
): { x: number; y: number } => {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x <= cols - w; x++) {
      let canPlace = true;
      for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
          const occupied = items.find(
            (item) =>
              x + dx >= item.x &&
              x + dx < item.x + item.w &&
              y + dy >= item.y &&
              y + dy < item.y + item.h
          );
          if (occupied) {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) break;
      }
      if (canPlace) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: rows };
};

export default function DirectoryPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [directory, setDirectory] = useState<Directory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gridCells, setGridCells] = useState<DirectoryItem[]>([]);
  const [layouts, setLayouts] = useState<Layouts>({ lg: [] });
  const [mapRefreshKey, setMapRefreshKey] = useState<number>(0);

  const rows = 16;
  const cols = 16;
  const rowHeight = 50;
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

  useEffect(() => {
    setLayouts({
      lg: gridCells.map((item) => ({
        i: item.id,
        x: item.x,
        y: item.y,
        w: Math.max(item.w, 4),
        h: Math.max(item.h, 3),
        minW: 4,
        minH: 3,
      })),
    });
  }, [gridCells]);

  const fetchDirectory = useCallback(async () => {
    try {
      const slug = pathname?.split('/').filter(Boolean)[1];
      if (!slug || !user) {
        setError('Invalid directory or user not authenticated.');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const directoriesRef = collection(userDocRef, 'directories');
      const q = query(directoriesRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        const data = docData.data();

        const itemsWithPositions = (data.items || []).map(
          (item: any) => ({
            ...item,
            id: item.id,
            x: item.x ?? 0,
            y: item.y ?? 0,
            w: Math.max(item.w ?? 4, 4),
            h: Math.max(item.h ?? 3, 3),
          })
        );

        setDirectory({
          id: docData.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          createdAt: data.createdAt,
          items: itemsWithPositions,
          position: data.position ?? 0,
        });

        setGridCells(itemsWithPositions);
        setLayouts({
          lg: itemsWithPositions.map((item: DirectoryItem) => ({
            i: item.id,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            minW: 4,
            minH: 3,
          })),
        });
      } else {
        setDirectory(null);
        setError(
          'Directory not found. Please check the URL and try again.'
        );
      }
    } catch (error) {
      console.error('Error fetching directory:', error);
      setError('Failed to load directory.');
    } finally {
      setLoading(false);
    }
  }, [user, pathname]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const debouncedSaveLayout = useMemo(
    () =>
      debounce(async (updatedItems: DirectoryItem[]) => {
        try {
          if (user && directory) {
            const directoryRef = doc(
              db,
              'users',
              user.uid,
              'directories',
              directory.id
            );
            await updateDoc(directoryRef, { items: updatedItems });
          }
        } catch (error) {
          console.error('Error saving layout:', error);
          toast({
            title: 'Error',
            description: 'Failed to save layout.',
            variant: 'destructive',
          });
        }
      }, 500),
    [user, directory]
  );

  const saveLayoutToDB = useCallback(
    (updatedItems: DirectoryItem[]) => {
      debouncedSaveLayout(updatedItems);
    },
    [debouncedSaveLayout]
  );

  const onLayoutChange = (layout: Layout[]) => {
    const updatedItems = gridCells.map((item) => {
      const layoutItem = layout.find((l) => l.i === item.id);
      return layoutItem
        ? {
            ...item,
            x: layoutItem.x,
            y: layoutItem.y,
            w: Math.max(layoutItem.w, 4),
            h: Math.max(layoutItem.h, 3),
          }
        : item;
    });
    setGridCells(updatedItems);
  };

  const onDragStop = (layout: Layout[]) => {
    const updatedItems = gridCells.map((item) => {
      const layoutItem = layout.find((l) => l.i === item.id);
      return layoutItem
        ? {
            ...item,
            x: layoutItem.x,
            y: layoutItem.y,
            w: Math.max(layoutItem.w, 4),
            h: Math.max(layoutItem.h, 3),
          }
        : item;
    });
    setGridCells(updatedItems);
    saveLayoutToDB(updatedItems);
  };

  const onResizeStop = (
    layout: Layout[],
    oldItem: Layout,
    newItem: Layout
  ) => {
    if (oldItem.w !== newItem.w || oldItem.h !== newItem.h) {
      const updatedItems = gridCells.map((item) =>
        item.id === newItem.i
          ? { ...item, w: newItem.w, h: newItem.h }
          : item
      );
      setGridCells(updatedItems);
      saveLayoutToDB(updatedItems);
    }
    setMapRefreshKey(Date.now());
  };

  const onAddItem = async (itemType: string, payload?: any) => {
    if (!user || !directory) {
      toast({
        title: 'Error',
        description: 'User not authenticated or directory not found.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const generatedId = doc(collection(db, 'directories')).id;
      const { x, y } = findPosition(gridCells, 4, 3, cols, rows);
      const newItem: DirectoryItem = {
        id: generatedId,
        name: itemType,
        directoryId: directory.id,
        x,
        y,
        w: 4,
        h: 3,
        minW: 4,
        minH: 3,
        ...payload,
      };
      setDirectory((prev) =>
        prev
          ? { ...prev, items: [...(prev.items || []), newItem] }
          : null
      );
      setGridCells((prevCells) => [...prevCells, newItem]);
      setLayouts((prevLayouts) => ({
        lg: [
          ...prevLayouts.lg,
          {
            i: newItem.id,
            x: newItem.x,
            y: newItem.y,
            w: newItem.w,
            h: newItem.h,
            minW: newItem.minW,
            minH: newItem.minH,
          },
        ],
      }));
      const directoryRef = doc(
        db,
        'users',
        user.uid,
        'directories',
        directory.id
      );
      await updateDoc(directoryRef, { items: arrayUnion(newItem) });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item.',
        variant: 'destructive',
      });
    }
  };

  const onResizeStart = () => {
    document.body.classList.add('disable-selection');
  };

  const onResize = debounce(
    (layout: Layout[], oldItem: Layout, newItem: Layout) => {
      const updatedItems = gridCells.map((item) =>
        item.id === newItem.i
          ? { ...item, w: newItem.w, h: newItem.h }
          : item
      );
      setGridCells(updatedItems);
    },
    100
  );

  // Main render with Footer always present
  return (
    <div className="flex flex-col min-h-screen">
      {loading ? (
        <main className="flex-1 flex justify-center items-center">
          <div className="max-w-[300px] m-auto">
            <div className="mt-10">
              <LoadingSpinner />
            </div>
          </div>
        </main>
      ) : error ? (
        <main className="flex-1 flex justify-center">
          <div className="text-md text-center text-foreground/100 max-w-[300px]">
            <p className="mt-10">{error}</p>
          </div>
        </main>
      ) : !directory ? (
        <main className="flex-1 flex">
          <div className="text-md text-center text-foreground/100 max-w-[300px]">
            <p className="mt-10">Directory not found.</p>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col">
          <div className="border-border border-b py-10">
            <Ui>
              <div className="flex flex-col sm:flex-row items-start gap-5 justify-between">
                <div className="flex items-start flex-col text-start max-w-[100%] sm:max-w-[50%]">
                  <h1 className="text-2xl font-bold">
                    {directory.name}
                  </h1>
                  {directory.description && (
                    <p className="text-foreground/60 mt-2">
                      {directory.description}
                    </p>
                  )}
                </div>
                <DirectorySettings
                  directory={directory}
                  onAddItem={onAddItem}
                  onDirectoryUpdated={(updatedDirectory) =>
                    setDirectory(updatedDirectory)
                  }
                />
              </div>
            </Ui>
          </div>
          <div
            className="flex-1 py-20"
            style={{ overflow: 'hidden' }}
          >
            <Ui>
              {gridCells.length === 0 ? (
                <div className="col-span-3 text-center text-foreground/100">
                  <h3>No items found.</h3>
                  <p className="block text-muted-foreground">
                    Add assets or features to get started.
                  </p>
                </div>
              ) : (
                <ResponsiveGridLayout
                  className="layout"
                  layouts={layouts}
                  breakpoints={breakpoints}
                  cols={{
                    lg: cols,
                    md: cols,
                    sm: cols,
                    xs: 6,
                    xxs: 2,
                  }}
                  rowHeight={rowHeight}
                  margin={[40, 40]}
                  containerPadding={[0, 0]}
                  onLayoutChange={onLayoutChange}
                  onResizeStart={onResizeStart}
                  onDragStop={onDragStop}
                  onResizeStop={onResizeStop}
                  onResize={onResize}
                  isDraggable={true}
                  isResizable={true}
                  compactType={null}
                  preventCollision={true}
                  draggableHandle=".directory-item-drag-handle"
                  draggableCancel=".timetable-drag-handle"
                  maxRows={rows}
                >
                  {gridCells.map((item) => {
                    if (directoryItemComponents[item.name]) {
                      return (
                        <div key={item.id}>
                          {React.createElement(
                            directoryItemComponents[item.name],
                            {
                              directoryId: directory.id,
                              width: item.w,
                              height: item.h,
                              itemData: item,
                              mapRefreshKey: mapRefreshKey,
                              onDirectoryItemRemoved: async (
                                id: string
                              ) => {
                                const updatedItems = gridCells.filter(
                                  (cell) => cell.id !== id
                                );
                                setGridCells(updatedItems);
                                setLayouts((prevLayouts) => ({
                                  ...prevLayouts,
                                  lg: prevLayouts.lg.filter(
                                    (l) => l.i !== id
                                  ),
                                }));
                                await saveLayoutToDB(updatedItems);
                              },
                            }
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div key={item.id}>
                          Unknown item: {item.name}
                        </div>
                      );
                    }
                  })}
                </ResponsiveGridLayout>
              )}
            </Ui>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Footer from '@/components/footer';
import { useAuth } from '@/context/auth-context';
import Ui from '@/containers/ui';
import CreateDirectoryForm from '@/components/create-directory';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  CircleCheckBig,
  CalendarCheck,
  Link,
  Workflow,
  Grip,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import AIAssistant from '@/components/ai-assistent';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useData } from '@/context/data-context';
import DataSummary from '@/components/data-summary';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from '@/components/sortable-item';

interface Directory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  position: number;
}

export default function Start() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(false);
  const { tasks, events, habits, dailies, nodePanels } = useData();

  const handleCloseDialog = () => setIsDialogOpen(false);

  const fetchDirectories = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const directoriesRef = collection(userDocRef, 'directories');
      const snapshot = await getDocs(directoriesRef);
      const fetchedDirectories = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          position: data.position ?? 0,
        } as Directory;
      });
      setDirectories(fetchedDirectories);
    } catch (error) {
      console.error('Error fetching directories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load directories.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectories();
  }, [user]);

  const groupDataByMonth = (
    items: any[],
    getDate: (item: any) => Date
  ) => {
    const MONTHS = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthMap: Record<number, number> = {};
    for (let i = 0; i < 12; i++) {
      monthMap[i] = 0;
    }
    for (const item of items) {
      const date = getDate(item);
      if (isNaN(date.getTime())) continue;
      const monthIndex = date.getMonth();
      monthMap[monthIndex]++;
    }
    return Object.entries(monthMap).map(([idx, count]) => ({
      month: MONTHS[Number(idx)],
      count,
    }));
  };

  const computeTrend = (
    groupedData: { month: string; count: number }[],
    key: 'count'
  ): number | null => {
    const currentMonth = new Date().getMonth();
    if (currentMonth === 0) return null;
    const current = groupedData[currentMonth]?.[key] || 0;
    const previous = groupedData[currentMonth - 1]?.[key] || 0;
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
  };

  const formatTrend = (trend: number | null): string => {
    if (trend === null) return 'No data';
    if (trend === 0) return 'No change';
    return trend > 0
      ? `Trending up by ${trend.toFixed(1)}% this month`
      : `Trending down by ${Math.abs(trend).toFixed(1)}% this month`;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const sortedDirectories = [...directories].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );

  const updateDirectoryPositions = async (newOrder: Directory[]) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const directoriesRef = collection(userDocRef, 'directories');
    try {
      await Promise.all(
        newOrder.map((directory) => {
          const directoryDocRef = doc(directoriesRef, directory.id);
          return updateDoc(directoryDocRef, {
            position: directory.position,
          });
        })
      );
    } catch (error) {
      console.error('Error updating directory positions:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedDirectories.findIndex(
        (d) => d.id === active.id
      );
      const newIndex = sortedDirectories.findIndex(
        (d) => d.id === over.id
      );
      const newOrder = arrayMove(
        sortedDirectories,
        oldIndex,
        newIndex
      );
      newOrder.forEach((dir, index) => {
        dir.position = index;
      });
      setDirectories(newOrder);
      updateDirectoryPositions(newOrder);
    }
  };

  return (
    <>
      <div className="border-border border-b py-10">
        <Ui>
          <div className="flex items-center justify-between">
            <div className="flex items-start flex-col text-start max-w-[50%]">
              <h1 className="text-2xl font-bold">
                Directory Overview
              </h1>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  Add New Directory{' '}
                  <Plus className="ml-2" size={18} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <CreateDirectoryForm onClose={handleCloseDialog} />
              </DialogContent>
            </Dialog>
          </div>
        </Ui>
      </div>

      <Ui>
        {user ? (
          loading ? (
            <div className="flex-1 py-20 text-center">
              <LoadingSpinner />
            </div>
          ) : directories.length > 0 ? (
            <div className="flex gap-10 py-20">
              <div className="w-1/3 p-6 bg-card border border-border rounded-lg">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedDirectories.map((d) => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue={
                        sortedDirectories.length > 0
                          ? sortedDirectories[0].id
                          : undefined
                      }
                    >
                      {sortedDirectories.map((directory) => {
                        const tasksInDirectory = tasks.filter(
                          (task) => task.directoryId === directory.id
                        );
                        const eventsInDirectory = events.filter(
                          (evt) => evt.directoryId === directory.id
                        );
                        const habitsInDirectory = habits.filter(
                          (chn) => chn.directoryId === directory.id
                        );

                        const nodePanelsInDirectory =
                          nodePanels.filter(
                            (node) =>
                              node.directoryId === directory.id
                          );

                        const allData = [
                          ...tasksInDirectory,
                          ...eventsInDirectory,
                          ...habitsInDirectory,
                          ...nodePanelsInDirectory,
                        ];

                        const groupedData = groupDataByMonth(
                          allData,
                          (item) => {
                            if ('createdAt' in item)
                              return new Date(item.createdAt);
                            else if ('date' in item)
                              return new Date(item.date);
                            else if ('startDate' in item)
                              return new Date(item.startDate);
                            return new Date();
                          }
                        );

                        const trend = computeTrend(
                          groupedData,
                          'count'
                        );

                        return (
                          <SortableItem
                            key={directory.id}
                            item={{ id: directory.id }}
                          >
                            <AccordionItem
                              value={directory.id}
                              className="py-4 border-0 data-[state=closed]:opacity-50 transition-opacity duration-200 data-[state=closed]:hover:opacity-100"
                            >
                              <AccordionTrigger className="py-0 flex items-center">
                                <div className="flex items-center">
                                  <Grip
                                    size={14}
                                    className="cursor-grab mr-2"
                                  />
                                  <h3 className="text-lg">
                                    {directory.name}
                                  </h3>
                                </div>
                              </AccordionTrigger>
                              {directory.description && (
                                <p className="text-muted-foreground text-sm">
                                  {directory.description}
                                </p>
                              )}
                              <AccordionContent className="py-5">
                                <div className="flex flex-col gap-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {tasksInDirectory.length > 0 && (
                                      <div className="flex flex-col">
                                        <span className="text-foreground/60 text-sm flex items-center gap-2">
                                          <CircleCheckBig size={14} />
                                          <span>Tasks</span>
                                        </span>
                                        <span className="text-foreground font-semibold text-xl">
                                          {tasksInDirectory.length}{' '}
                                          task
                                          {tasksInDirectory.length !==
                                          1
                                            ? 's'
                                            : ''}
                                        </span>
                                      </div>
                                    )}
                                    {eventsInDirectory.length > 0 && (
                                      <div className="flex flex-col">
                                        <span className="text-foreground/60 text-sm flex items-center gap-2">
                                          <CalendarCheck size={14} />
                                          <span>Events</span>
                                        </span>
                                        <span className="text-foreground font-semibold text-xl">
                                          {eventsInDirectory.length}{' '}
                                          event
                                          {eventsInDirectory.length !==
                                          1
                                            ? 's'
                                            : ''}
                                        </span>
                                      </div>
                                    )}
                                    {habitsInDirectory.length > 0 && (
                                      <div className="flex flex-col">
                                        <span className="text-foreground/60 text-sm flex items-center gap-2">
                                          <Link size={14} />
                                          <span>habits</span>
                                        </span>
                                        <span className="text-foreground font-semibold text-xl">
                                          {habitsInDirectory.length}{' '}
                                          chain
                                          {habitsInDirectory.length !==
                                          1
                                            ? 's'
                                            : ''}
                                        </span>
                                      </div>
                                    )}

                                    {nodePanelsInDirectory.length >
                                      0 && (
                                      <div className="flex flex-col">
                                        <span className="text-foreground/60 text-sm flex items-center gap-2">
                                          <Workflow size={14} />
                                          <span>Node Panels</span>
                                        </span>
                                        <span className="text-foreground font-semibold text-xl">
                                          {
                                            nodePanelsInDirectory.length
                                          }{' '}
                                          Panel
                                          {nodePanelsInDirectory.length !==
                                          1
                                            ? 's'
                                            : ''}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <Card className="border-none mt-4">
                                    <CardHeader className="items-start p-0">
                                      <CardTitle className="text-sm">
                                        Activity Over Time
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-0">
                                      <ResponsiveContainer
                                        width="100%"
                                        height={200}
                                      >
                                        <AreaChart
                                          data={groupedData}
                                          margin={{
                                            top: 30,
                                            right: 0,
                                            left: 0,
                                            bottom: 0,
                                          }}
                                        >
                                          <CartesianGrid
                                            vertical={false}
                                            horizontal={false}
                                            strokeDasharray="0"
                                            stroke="hsl(var(--border))"
                                          />
                                          <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                            tickFormatter={(value) =>
                                              value.slice(0, 3)
                                            }
                                            padding={{
                                              left: 0,
                                              right: 0,
                                            }}
                                          />
                                          <YAxis
                                            hide={true}
                                            padding={{
                                              top: 0,
                                              bottom: 0,
                                            }}
                                          />
                                          <Tooltip />
                                          <defs>
                                            <linearGradient
                                              id="fillActivity"
                                              x1="0"
                                              y1="0"
                                              x2="0"
                                              y2="1"
                                            >
                                              <stop
                                                offset="5%"
                                                stopColor="var(--ui-primary)"
                                                stopOpacity={0.8}
                                              />
                                              <stop
                                                offset="95%"
                                                stopColor="var(--ui-primary)"
                                                stopOpacity={0.1}
                                              />
                                            </linearGradient>
                                          </defs>
                                          <Area
                                            dataKey="count"
                                            name="Activity"
                                            type="monotone"
                                            stroke="var(--ui-primary)"
                                            fill="url(#fillActivity)"
                                            fillOpacity={0.6}
                                          />
                                        </AreaChart>
                                      </ResponsiveContainer>
                                    </CardContent>
                                    <CardFooter className="flex-col gap-2 text-sm">
                                      <div className="flex items-center gap-2 font-medium leading-none">
                                        {trend !== null ? (
                                          trend >= 0 ? (
                                            <>
                                              <TrendingUp size={14} />
                                              <span>
                                                {formatTrend(trend)}
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <TrendingDown
                                                size={14}
                                              />
                                              <span>
                                                {formatTrend(trend)}
                                              </span>
                                            </>
                                          )
                                        ) : (
                                          'No data'
                                        )}
                                      </div>
                                      <div className="leading-none text-muted-foreground">
                                        Showing total activity for the
                                        last 6 months
                                      </div>
                                    </CardFooter>
                                  </Card>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </SortableItem>
                        );
                      })}
                    </Accordion>
                  </SortableContext>
                </DndContext>
              </div>
              <div className="w-2/3 flex flex-col gap-10">
                <AIAssistant />
                <DataSummary />
              </div>
            </div>
          ) : (
            <div className="flex-1 py-20 text-center text-foreground/100">
              <h3 className="text-xl font-semibold mb-1">
                Welcome to Panellio.
              </h3>
              <p className="mb-8">Start by following these steps:</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-[720px] m-auto">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[--ui-primary] text-white dark:text-black flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <p className="text-foreground font-semibold">
                    Edit your info in Settings
                  </p>
                  <p className="text-muted-foreground text-sm max-w-[200px]">
                    Edit your name, location, and username to
                    personalize your experience.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[--ui-primary] text-white dark:text-black flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <p className="text-foreground font-semibold">
                    Add directories
                  </p>
                  <p className="text-muted-foreground text-sm max-w-[200px]">
                    Click &quot;Add New Directory&quot; to create
                    organizational directories.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[--ui-primary] text-white dark:text-black flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <p className="text-foreground font-semibold">
                    Organize your directories
                  </p>
                  <p className="text-muted-foreground text-sm max-w-[200px]">
                    Add features like tasks, events, and places to
                    your directories.
                  </p>
                </div>
              </div>
              <p className="mx-auto mt-10 text-muted-foreground max-w-[500px]">
                Once your data grows, you can view directory summaries
                and use AI Assistant to help you manage your life.
                Feel free to customize the look and feel of your
                directories to suit your needs.
              </p>
            </div>
          )
        ) : (
          <p className="text-md text-foreground/100 max-w-[300px] m-auto">
            You need to log in or create an account to view this page.
          </p>
        )}
      </Ui>
      <Footer />
    </>
  );
}

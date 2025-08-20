'use client';

import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Label,
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useData } from '@/context/data-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorThemeProvider } from '@/providers/color-theme-provider';
import { useTheme } from 'next-themes';

function groupDataByMonth<T>(
  items: T[],
  getDate: (item: T) => Date,
  isCompleted?: (item: T) => boolean
) {
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

  const monthMap: Record<
    number,
    { total: number; completed: number }
  > = {};
  for (let i = 0; i < 12; i++) {
    monthMap[i] = { total: 0, completed: 0 };
  }

  for (const item of items) {
    const date = getDate(item);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', date);
      continue;
    }
    const monthIndex = date.getMonth();
    if (monthIndex < 0 || monthIndex > 11) {
      console.error('Invalid month index:', monthIndex);
      continue;
    }
    monthMap[monthIndex].total++;
    if (isCompleted && isCompleted(item)) {
      monthMap[monthIndex].completed++;
    }
  }

  return Object.entries(monthMap).map(([idx, data]) => {
    const monthIndex = Number(idx);
    return {
      month: MONTHS[monthIndex],
      total: data.total,
      completed: data.completed,
    };
  });
}

function computeTrend(
  groupedData: { month: string; total: number; completed: number }[],
  key: 'total' | 'completed'
): number | null {
  const currentMonth = new Date().getMonth();
  if (currentMonth === 0) return null;
  const current = groupedData[currentMonth]?.[key] || 0;
  const previous = groupedData[currentMonth - 1]?.[key] || 0;
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function formatTrend(trend: number | null): string {
  if (trend === null) return 'No data';
  if (trend === 0) return 'No change';
  return trend > 0
    ? `Trending up by ${trend.toFixed(1)}% this month`
    : `Trending down by ${Math.abs(trend).toFixed(1)}% this month`;
}

export default function DataSummary() {
  const { tasks, events, habits, dailies, loading } = useData();
  const [selectedData, setSelectedData] = useState<
    'tasks' | 'events' | 'daily' | 'habits'
  >('tasks');

  const { resolvedTheme } = useTheme();
  const linearColor =
    resolvedTheme === 'dark' ? 'var(--blue-800)' : 'var(--blue-200)';

  const groupedTasks = useMemo(
    () =>
      groupDataByMonth(
        tasks,
        (task) =>
          task.dueDate
            ? new Date(task.dueDate)
            : new Date(task.createdAt),
        (task) => task.completed
      ),
    [tasks]
  );
  const finishedTasks = tasks.filter((task) => task.completed).length;
  const unfinishedTasks = tasks.length - finishedTasks;
  const totalTasks = tasks.length;
  const tasksChartData = [
    {
      status: 'Finished',
      count: finishedTasks,
      fill: 'var(--ui-primary)',
    },
    {
      status: 'Unfinished',
      count: unfinishedTasks,
      fill: 'var( --blue-800)',
    },
  ];
  const tasksChartConfig: ChartConfig = {
    finished: { label: 'Finished', color: 'var(--ui-primary)' },
    unfinished: {
      label: 'Unfinished',
      color: 'var( --blue-800)',
    },
  };
  const tasksTrend = computeTrend(groupedTasks, 'total');

  const groupedEvents = useMemo(
    () =>
      groupDataByMonth(
        events,
        (event) => new Date(event.startDate),
        (event) => new Date(event.startDate) <= new Date()
      ),
    [events]
  );
  const upcomingEvents = events.filter(
    (event) => new Date(event.startDate) > new Date()
  ).length;
  const completedEvents = events.length - upcomingEvents;
  const totalEvents = events.length;
  const eventsChartData = [
    {
      status: 'Upcoming',
      count: upcomingEvents,
      fill: 'hsl(var(--chart-3))',
    },
    {
      status: 'Completed',
      count: completedEvents,
      fill: 'hsl(var(--chart-4))',
    },
  ];
  const eventsChartConfig: ChartConfig = {
    upcoming: { label: 'Upcoming', color: 'hsl(var(--chart-3))' },
    past: { label: 'Completed', color: 'hsl(var(--chart-4))' },
  };
  const eventsTrend = computeTrend(groupedEvents, 'total');

  const isHabitActive = (habit: (typeof habits)[number]) =>
    habit.days.some((day) => !day.completed);
  const groupedHabits = useMemo(
    () =>
      groupDataByMonth(
        habits,
        (habit) => new Date(habit.startDate),
        isHabitActive
      ),
    [habits]
  );
  const activeHabits = habits.filter(isHabitActive).length;
  const inactiveHabits = habits.length - activeHabits;
  const totalHabits = habits.length;
  const habitsChartData = [
    {
      status: 'Active',
      count: activeHabits,
      fill: 'var( --blue-800)',
    },
    {
      status: 'Inactive',
      count: inactiveHabits,
      fill: 'hsl(var(--chart-6))',
    },
  ];
  const habitsChartConfig: ChartConfig = {
    active: { label: 'Active', color: 'var( --blue-800)' },
    inactive: { label: 'Inactive', color: 'hsl(var(--chart-6))' },
  };
  const habitsTrend = computeTrend(groupedHabits, 'total');

  const groupedDailyBlocks = useMemo(() => {
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
    const monthMap = Array.from({ length: 12 }, () => ({
      total: 0,
      completed: 0,
      uncompleted: 0,
    }));
    for (const daily of dailies) {
      const date = new Date(daily.date);
      if (isNaN(date.getTime())) continue;
      const monthIndex = date.getMonth();
      const totalBlocks = daily.blocks.length;
      const completedBlocks = daily.blocks.filter(
        (block) => block.completed
      ).length;
      monthMap[monthIndex].total += totalBlocks;
      monthMap[monthIndex].completed += completedBlocks;
      monthMap[monthIndex].uncompleted +=
        totalBlocks - completedBlocks;
    }
    return monthMap.map((data, idx) => ({
      month: MONTHS[idx],
      total: data.total,
      completed: data.completed,
      uncompleted: data.uncompleted,
    }));
  }, [dailies]);

  const totalBlocks = dailies.reduce(
    (sum, daily) => sum + daily.blocks.length,
    0
  );
  const completedBlocks = dailies.reduce(
    (sum, daily) =>
      sum + daily.blocks.filter((b) => b.completed).length,
    0
  );
  const uncompletedBlocks = totalBlocks - completedBlocks;
  const dailyChartData = [
    {
      status: 'Completed',
      count: completedBlocks,
      fill: 'var(--ui-primary)',
    },
    {
      status: 'Uncompleted',
      count: uncompletedBlocks,
      fill: 'var(--primary-opacity)',
    },
  ];
  const dailyChartConfig: ChartConfig = {
    completed: { label: 'Completed', color: 'hsl(var(--chart-7))' },
    uncompleted: {
      label: 'Uncompleted',
      color: 'hsl(var(--chart-8))',
    },
  };
  const dailyTrend = computeTrend(groupedDailyBlocks, 'total');

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6 bg-card border border-border p-6 rounded-lg">
      <div className="flex justify-end">
        <Select
          value={selectedData}
          onValueChange={(value) =>
            setSelectedData(
              value as 'tasks' | 'events' | 'daily' | 'habits'
            )
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tasks">Tasks</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="habits">Habits</SelectItem>{' '}
          </SelectContent>
        </Select>
      </div>
      {selectedData === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Finished vs. Unfinished
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ColorThemeProvider>
                <ChartContainer
                  config={tasksChartConfig}
                  className="mx-auto aspect-square max-h-[280px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={tasksChartData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {tasksChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                        />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (
                            viewBox &&
                            'cx' in viewBox &&
                            'cy' in viewBox
                          ) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan className="fill-foreground text-3xl font-bold">
                                  {totalTasks}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Tasks
                                </tspan>
                              </text>
                            );
                          }
                          return null;
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </ColorThemeProvider>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {tasksTrend !== null ? (
                  tasksTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatTrend(tasksTrend)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{formatTrend(tasksTrend)}</span>
                    </>
                  )
                ) : (
                  'No data'
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                Finished: {finishedTasks} / Unfinished:{' '}
                {unfinishedTasks}
              </div>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-none">
            <CardHeader className="items-center">
              <CardTitle>Tasks Over Time</CardTitle>
              <CardDescription>Tasks by Month</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={groupedTasks}
                  margin={{
                    top: 30,
                    right: 20,
                    left: -40,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="0"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    padding={{ left: 0, right: 0 }}
                  />
                  <YAxis padding={{ top: 0, bottom: 0 }} />
                  <Tooltip />

                  <defs>
                    <linearGradient
                      id="fillTotalTasks"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={linearColor}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={linearColor}
                        stopOpacity={0.5}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillFinishedTasks"
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
                    dataKey="total"
                    name="Total Tasks"
                    type="monotone"
                    stroke="var(--blue-800)"
                    fill="url(#fillTotalTasks)"
                    fillOpacity={0.4}
                  />
                  <Area
                    dataKey="completed"
                    name="Completed Tasks"
                    type="monotone"
                    stroke="var(--ui-primary)"
                    fill="url(#fillFinishedTasks)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {tasksTrend !== null ? (
                  tasksTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatTrend(tasksTrend)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{formatTrend(tasksTrend)}</span>
                    </>
                  )
                ) : (
                  'No data'
                )}
              </div>
              <div className="leading-none text-muted-foreground text-sm">
                Total Tasks: {totalTasks}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
      {selectedData === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Upcoming vs. Completed
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={eventsChartConfig}
                className="mx-auto aspect-square max-h-[280px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={eventsChartData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {eventsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (
                          viewBox &&
                          'cx' in viewBox &&
                          'cy' in viewBox
                        ) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan className="fill-foreground text-3xl font-bold">
                                {totalEvents}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Events
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {eventsTrend !== null ? (
                  eventsTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatTrend(eventsTrend)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{formatTrend(eventsTrend)}</span>
                    </>
                  )
                ) : (
                  'No data'
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                Upcoming: {upcomingEvents} / Completed:{' '}
                {completedEvents}
              </div>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Events Over Time</CardTitle>
              <CardDescription>Events by Month</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={groupedEvents}
                  margin={{
                    top: 30,
                    right: 20,
                    left: -40,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="0"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    padding={{ left: 0, right: 0 }}
                  />
                  <YAxis padding={{ top: 0, bottom: 0 }} />
                  <Tooltip />

                  <defs>
                    <linearGradient
                      id="fillTotalEvents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-3))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-3))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillCompletedEvents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-4))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-4))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="total"
                    name="Total Events"
                    type="monotone"
                    stroke="hsl(var(--chart-3))"
                    fill="url(#fillTotalEvents)"
                    fillOpacity={0.4}
                  />
                  <Area
                    dataKey="completed"
                    name="Completed Events"
                    type="monotone"
                    stroke="hsl(var(--chart-4))"
                    fill="url(#fillCompletedEvents)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {eventsTrend !== null ? (
                  eventsTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatTrend(eventsTrend)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{formatTrend(eventsTrend)}</span>
                    </>
                  )
                ) : (
                  'No data'
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                Total Events: {totalEvents}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
      {selectedData === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Daily Blocks</CardTitle>
              <CardDescription>
                Completed vs. Uncompleted
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={dailyChartConfig}
                className="mx-auto aspect-square max-h-[280px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={dailyChartData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {dailyChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill || '#ccc'}
                      />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (
                          viewBox &&
                          'cx' in viewBox &&
                          'cy' in viewBox
                        ) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan className="fill-foreground text-3xl font-bold">
                                {totalBlocks}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Blocks
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {dailyTrend !== null ? (
                  dailyTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatTrend(dailyTrend)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{formatTrend(dailyTrend)}</span>
                    </>
                  )
                ) : (
                  'No data'
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                Completed: {completedBlocks} / Uncompleted:{' '}
                {uncompletedBlocks}
              </div>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Daily Blocks Over Time</CardTitle>
              <CardDescription>Blocks by Month</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={groupedDailyBlocks}
                  margin={{
                    top: 30,
                    right: 20,
                    left: -40,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="0"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    padding={{ left: 0, right: 0 }}
                  />
                  <YAxis padding={{ top: 0, bottom: 0 }} />
                  <Tooltip />

                  <defs>
                    <linearGradient
                      id="fillCompletedDaily"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-7))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-7))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillUncompletedDaily"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-8))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-8))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="completed"
                    name="Completed Blocks"
                    type="monotone"
                    stroke="hsl(var(--chart-7))"
                    fill="url(#fillCompletedDaily)"
                    fillOpacity={0.6}
                  />
                  <Area
                    dataKey="uncompleted"
                    name="Uncompleted Blocks"
                    type="monotone"
                    stroke="hsl(var(--chart-8))"
                    fill="url(#fillUncompletedDaily)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {dailyTrend !== null ? (
                  dailyTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatTrend(dailyTrend)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{formatTrend(dailyTrend)}</span>
                    </>
                  )
                ) : (
                  'No data'
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                Total Blocks: {totalBlocks}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {selectedData === 'habits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Habits</CardTitle>{' '}
              <CardDescription>Active vs. Inactive</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={habitsChartConfig}
                className="mx-auto aspect-square max-h-[280px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={habitsChartData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {habitsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (
                          viewBox &&
                          'cx' in viewBox &&
                          'cy' in viewBox
                        ) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan className="fill-foreground text-3xl font-bold">
                                {totalHabits}{' '}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Habits
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {habitsTrend !== null ? (
                  habitsTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatTrend(habitsTrend)}</span>{' '}
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{formatTrend(habitsTrend)}</span>{' '}
                    </>
                  )
                ) : (
                  'No data'
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                Active: {activeHabits} / Inactive: {inactiveHabits}{' '}
              </div>
            </CardFooter>
          </Card>

          <Card className="flex flex-col border-none">
            <CardHeader className="items-center pb-0">
              <CardTitle>Habits Over Time</CardTitle>{' '}
              <CardDescription>Habits by Month</CardDescription>{' '}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={groupedHabits}
                  margin={{
                    top: 30,
                    right: 20,
                    left: -40,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="0"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    padding={{ left: 0, right: 0 }}
                  />
                  <YAxis padding={{ top: 0, bottom: 0 }} />
                  <Tooltip />

                  <defs>
                    <linearGradient
                      id="fillTotalHabits"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-6))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-6))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillActiveHabits"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var( --blue-800)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var( --blue-800)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="total"
                    name="Total Habits"
                    type="monotone"
                    stroke="hsl(var(--chart-6))"
                    fill="url(#fillTotalHabits)"
                    fillOpacity={0.4}
                  />
                  <Area
                    dataKey="completed"
                    name="Active Habits"
                    type="monotone"
                    stroke="var( --blue-800)"
                    fill="url(#fillActiveHabits)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                {habitsTrend !== null ? (
                  habitsTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>{formatTrend(habitsTrend)}</span>{' '}
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{formatTrend(habitsTrend)}</span>{' '}
                    </>
                  )
                ) : (
                  'No data'
                )}
              </div>
              <div className="leading-none text-muted-foreground">
                Total Habits: {totalHabits}{' '}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

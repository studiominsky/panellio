'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  Shapes,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import Wide from '@/containers/wide';

function Features() {
  const data = [
    { name: 'Jan', activity: 12 },
    { name: 'Feb', activity: 19 },
    { name: 'Mar', activity: 15 },
    { name: 'Apr', activity: 25 },
    { name: 'May', activity: 22 },
    { name: 'Jun', activity: 30 },
  ];
  return (
    <Wide>
      <div className="mt-[75px] md:mt-[100px]">
        <div className="flex flex-col gap-5 items-center justify-between md:flex-row md:gap-0">
          <h2 className="size-[100%] text-center text-[35px] md:text-[45px] font-bold leading-tight md:size-[50%] md:text-start">
            Features and their benefits.
          </h2>

          <div className="flex flex-col gap-2 size-[100%] sm:size-[70%] text-center md:size-[40%] md:text-start">
            <span className="flex items-center gap-2 m-auto text-foreground/60 md:m-0">
              <Shapes className="w-5 h-5 text-foreground/60" />
              <span className="text-sm font-normal">Features</span>
            </span>
            <p className="text-foreground leading-9 text-2xl font-semibold">
              How adding features can help you in your personal and
              professional life.
            </p>
          </div>
        </div>
        <div className="flex  flex-col mt-[60px] gap-8 w-full lg:flex-row">
          <div className="flex flex-col w-full bg-card border border-border rounded-xl p-6 md:p-8 lg:w-1/3">
            <p className="text-foreground/60 text-lg">
              <span className="text-inverted font-bold">
                Some features
              </span>{' '}
              you can add to your profile. Sign up to discover more.
            </p>

            <Accordion type="single" collapsible className="mt-10">
              <AccordionItem value="item-1">
                <AccordionTrigger className="pt-0">
                  Tasks
                </AccordionTrigger>
                <AccordionContent>
                  Manage your to-do lists, prioritize tasks, and track
                  your progress to stay organized and productive.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Bookmarks</AccordionTrigger>
                <AccordionContent>
                  Save and organize links to your favorite websites,
                  articles, and resources for easy access.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Habits</AccordionTrigger>
                <AccordionContent>
                  Build and track positive habits, monitor your
                  progress, and stay motivated with streaks and
                  reminders.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Notes</AccordionTrigger>
                <AccordionContent>
                  Capture your thoughts, ideas, and important
                  information with a flexible and easy-to-use
                  note-taking system.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Daily</AccordionTrigger>
                <AccordionContent>
                  Plan your day, set priorities, and manage your time
                  effectively with a dedicated daily planner.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="flex flex-col w-full bg-card -auto border border-border rounded-xl p-6 md:p-8 lg:w-2/3">
            <p className="text-center max-w-full text-foreground/60 text-lg md:max-w-[60%] md:text-start">
              <span className="text-inverted font-bold">Monitor</span>{' '}
              your progress by completing tasks, forming habits, and
              staying consistent.
            </p>
            <div className="flex flex-col justify-between items-center mt-10 fill-[--ui-primary] transition duration-300 md:flex-row md:items-start md:gap-8">
              <div className="flex items-baseline gap-12 justify-center flex-row md:flex-col md:gap-0 md:items-start md:justify-normal">
                <div className="flex flex-col">
                  <span className="text-foreground/60 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Tasks</span>
                  </span>
                  <span className="text-foreground font-semibold text-3xl">
                    32
                  </span>
                  <span className="text-green-500 flex gap-1 items-center dark:text-green-400">
                    <TrendingUp size={16} />
                    <span className="text-sm font-semibold">
                      12.4%
                    </span>
                  </span>
                </div>
                <div className="flex flex-col md:mt-7">
                  <span className="text-foreground/60 text-sm flex items-center gap-2">
                    <Flame size={16} />
                    <span>Habits</span>
                  </span>
                  <span className="text-foreground font-semibold text-3xl">
                    4
                  </span>
                  <span className="text-red-500 flex gap-1 items-center dark:text-red-400">
                    <TrendingDown size={16} />
                    <span className="text-sm font-semibold">
                      18.5%
                    </span>
                  </span>
                </div>
              </div>
              <div className="mt-10 md:mt-0 w-full flex-1">
                <div className="flex flex-col w-full justify-end items-center md:items-end">
                  <span className="text-foreground/60 text-sm flex justify-end items-center gap-2">
                    <Activity size={16} />
                    <span>Activity</span>
                  </span>
                  <span className="text-foreground font-bold text-xl text-end">
                    <span>Activity Over Time</span>
                  </span>
                </div>
                <div className="w-full h-[230px] mt-5 flex items-end ml-auto justify-end">
                  <ResponsiveContainer width="90%" height="100%">
                    <AreaChart
                      data={data}
                      margin={{
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0,
                      }}
                    >
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
                      <CartesianGrid
                        vertical={false}
                        horizontal={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={true}
                        axisLine={true}
                        tickMargin={10}
                      />
                      <YAxis hide={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                        }}
                      />
                      <Area
                        dataKey="activity"
                        name="Activity"
                        type="monotone"
                        stroke="var(--ui-primary)"
                        fill="url(#fillActivity)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wide>
  );
}

export default Features;

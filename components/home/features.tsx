'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
  Activity,
  CalendarDays,
  Shapes,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Wide from '@/containers/wide';

function Features() {
  const data = [
    {
      name: 'Januar',
      points: 300,
    },
    {
      name: 'Februar',
      points: 170,
    },
    {
      name: 'March',
      points: 230,
    },
    {
      name: 'April',
      points: 420,
    },
    {
      name: 'May',
      points: 580,
    },
    {
      name: 'June',
      points: 905,
    },
    {
      name: 'July',
      points: 690,
    },
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
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Bookmarks</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Lists</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>habits</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Blocks</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="flex flex-col w-full bg-card -auto border border-border rounded-xl p-6 md:p-8 lg:w-2/3">
            <p className="text-center max-w-full text-foreground/60 text-lg md:max-w-[60%] md:text-start">
              <span className="text-inverted font-bold">Monitor</span>{' '}
              your progress by finishing tasks, respecting time
              blocks, or not breaking the chain.
            </p>
            <div className="flex flex-col justify-between items-center mt-10 fill-[--ui-primary] transition duration-300 md:flex-row md:items-start">
              <div className="flex items-baseline gap-12 justify-center flex-row md:flex-col md:gap-0 md:items-start md:justify-normal">
                <div className="flex flex-col">
                  <span className="text-foreground/60 text-sm flex items-center gap-2">
                    <CalendarDays size={16} />
                    <span>Score</span>
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
                    <CalendarDays size={16} />
                    <span>Finished</span>
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
              <span className="mt-10 md:mt-0">
                <div className="flex flex-col w-full justify-end items-center md:items-end">
                  <span className="text-foreground/60 text-sm flex justify-end items-center gap-2">
                    <Activity size={16} />
                    <span>Activity</span>
                  </span>
                  <span className="text-foreground font-bold text-xl text-end">
                    <span>Score overview</span>
                  </span>
                </div>
                <BarChart
                  className="mt-5 flex bar-chart-responsive"
                  width={450}
                  height={230}
                  data={data}
                  margin={{
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />

                  <Bar dataKey="points" radius={[5, 5, 0, 0]} />
                </BarChart>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Wide>
  );
}

export default Features;

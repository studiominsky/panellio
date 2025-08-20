'use client';

import Full from '@/containers/full';
import { Activity, Blocks, Folders, Shapes } from 'lucide-react';
import { Badge } from '../ui/badge';
import Wide from '@/containers/wide';

function Intro() {
  return (
    <Wide>
      <div className="my-[60px] md:my-[120px]">
        <div className="flex flex-col gap-1 items-center justify-between ">
          <Badge
            variant="outline"
            className="py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          >
            Introduction <Blocks className="w-4 h-4 ml-2" />
          </Badge>
          <h2 className="text-[35px] text-center max-w-[600px] md:text-[45px] font-bold leading-tight">
            A way better way to organize your digital life
          </h2>

          <div className="flex flex-col mt-5 gap-5">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="m-auto max-w-[320px] text-center flex flex-col w-full justify-center md:max-w-full md:w-1/3 md:text-start">
                <span className="text-lg m-auto font-bold flex items-center gap-2 md:m-0">
                  <Folders size={21} />
                  <span>Create directories</span>
                </span>
                <span className="text-foreground/60 mt-2">
                  Directories are containers for your assets and
                  features. They allow you to to seperate your life
                  into different categories.
                </span>
              </div>
              <div className="m-auto max-w-[320px] text-center flex flex-col wF-full justify-center md:max-w-full md:w-1/3 md:text-start">
                <span className="text-lg m-auto font-bold flex items-center gap-2 md:m-0">
                  <Shapes size={21} />
                  <span>Add assets and features</span>
                </span>
                <span className="text-foreground/60 mt-2">
                  Assets and features are the building blocks of your
                  directories. Assets are simplz folders and files.
                  Features can be anything from tasks, to a challenge
                  tracker.
                </span>
              </div>
              <div className="m-auto max-w-[320px] text-center flex flex-col w-full justify-center md:max-w-full md:w-1/3 md:text-start">
                <span className="text-lg m-auto font-bold flex items-center gap-2 md:m-0">
                  <Activity size={21} />
                  <span>Monitor your progress</span>
                </span>
                <span className="text-foreground/60 mt-2">
                  By finishing tasks, or completing challenges, you
                  can monitor your progress and see how you are doing
                  in your life.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Wide>
  );
}

export default Intro;

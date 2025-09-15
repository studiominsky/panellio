'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  File,
  FileJson,
  Folders,
  ImageIcon,
  CalendarDays,
  Link2,
  Check,
  CalendarCheck2,
  CalendarClock,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ColorThemeSelector } from '../color-theme-selector';
import { Label } from '@/components/ui/label';
import Wide from '@/containers/wide';
import { useColorTheme } from '@/hooks/use-color-theme';
import { ChatAnimation } from './chat-animation'; // <-- Import the new component

function Cards() {
  const [showRemaining, setShowRemaining] = useState(false);
  const prevShowRemainingRef = useRef(showRemaining);
  const [colorTheme, setColorTheme] = useColorTheme();

  useEffect(() => {
    prevShowRemainingRef.current = showRemaining;
  });

  const shouldAnimate =
    prevShowRemainingRef.current !== showRemaining;
  const animationClass = shouldAnimate ? 'animate-slide-down' : '';

  function handleSwitchChange() {
    setShowRemaining(!showRemaining);
  }

  return (
    <Wide>
      <div className="mt-[100px] md:mt-[170px]">
        <div className="flex flex-col gap-5 items-center justify-between md:flex-row md:gap-0">
          <h2 className="size-[100%] text-center text-[35px] md:text-[45px] font-bold leading-tight md:size-[50%] md:text-start">
            Organize your way to success
          </h2>

          <div className="flex flex-col gap-2 size-[100%] sm:size-[70%] text-center md:size-[40%] md:text-start">
            <span className="flex items-center gap-2 m-auto text-foreground/60 md:m-0">
              <Folders className="w-5 h-5 text-foreground/60" />
              <span className="text-sm font-normal">Directories</span>
            </span>
            <p className="text-foreground leading-9 text-2xl font-semibold">
              All tools you need to stay focused and productive.
              Backed by science.
            </p>
          </div>
        </div>
        <div className="flex mt-[60px] flex-col gap-8 justify-center lg:flex-row">
          <div className="flex flex-col w-full bg-card border border-border rounded-xl p-6 md:p-8 lg:w-1/3">
            <p className="text-center text-foreground/60 text-lg md:text-start">
              <span className="text-inverted font-bold">
                Use assets
              </span>{' '}
              to make your files more organized.
            </p>
            <div className="flex justify-center gap-5 mt-10 mb-5 m-h-full align-middle md:justify-start">
              <div className="flex flex-col gap-3 items-center">
                <svg
                  className="folder-icon fill-[--ui-primary] transition duration-300"
                  width="80"
                  height="64"
                  viewBox="0 0 80 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M72 8H40L34.344 2.344C32.844 0.844 30.808 0 28.688 0H8C3.6 0 0 3.6 0 8V56C0 60.4 3.6 64 8 64H72C76.4 64 80 60.4 80 56V16C80 11.6 76.4 8 72 8Z" />
                </svg>
                <span className="text-sm font-semibold">Home</span>
              </div>
              <div className="flex flex-col gap-3 items-center">
                <svg
                  className="folder-icon fill-[--ui-primary] transition duration-300"
                  width="80"
                  height="64"
                  viewBox="0 0 80 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M72 8H40L34.344 2.344C32.844 0.844 30.808 0 28.688 0H8C3.6 0 0 3.6 0 8V56C0 60.4 3.6 64 8 64H72C76.4 64 80 60.4 80 56V16C80 11.6 76.4 8 72 8Z" />
                </svg>
                <span className="text-sm font-semibold">Learn</span>
              </div>
              <div className="flex flex-col gap-3 items-center">
                <svg
                  className="folder-icon fill-[--ui-primary] transition duration-300"
                  width="80"
                  height="64"
                  viewBox="0 0 80 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M72 8H40L34.344 2.344C32.844 0.844 30.808 0 28.688 0H8C3.6 0 0 3.6 0 8V56C0 60.4 3.6 64 8 64H72C76.4 64 80 60.4 80 56V16C80 11.6 76.4 8 72 8Z" />
                </svg>
                <span className="text-sm font-semibold">Develop</span>
              </div>
            </div>
            <div className="mt-7 flex flex-col">
              <div className="flex items-center justify-center py-3 gap-2 border-border border-t-[1px] border-solid md:justify-start">
                <ImageIcon size={16} />
                <span className="text-sm font-semibold">
                  Image.png
                </span>
                <span className="text-sm font-normal text-foreground/60">
                  518.70 KB
                </span>
              </div>
              <div className="flex items-center justify-center py-3 gap-2 border-border border-t-[1px] border-solid md:justify-start">
                <File size={16} />
                <span className="text-sm font-semibold">
                  File.txt
                </span>
                <span className="text-sm font-normal text-foreground/60">
                  2.70 KB
                </span>
              </div>
              <div className="flex items-center justify-center py-3 gap-2 border-border border-t-[1px] border-solid md:justify-start">
                <FileJson size={16} />
                <span className="text-sm font-semibold">
                  Data.json
                </span>
                <span className="text-sm font-normal text-foreground/60">
                  17.25 KB
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full bg-card border border-border rounded-xl p-6 md:p-8 lg:2/3">
            <p className="text-center text-foreground/60 md:max-w-[60%] text-lg md:text-start">
              <span className="text-inverted font-bold">
                Add features
              </span>{' '}
              that will make your online life easier and more focused,
              and productive.
            </p>
            <div className="flex flex-col gap-5 mt-10 m-h-full w-full justify-between items-start sm:flex-row">
              <div className="flex m-auto gap-8 sm:flex-col sm:gap-0 md:m-0">
                <div className="flex flex-col mb-7">
                  <span className="text-foreground/60 text-sm flex items-center gap-2">
                    <CalendarDays size={16} />
                    <span>Duration</span>
                  </span>
                  <span className="text-foreground font-semibold text-3xl">
                    21 days
                  </span>
                  <span className="text-[--ui-primary] text-sm font-semibold">
                    100%
                  </span>
                </div>
                {showRemaining ? (
                  <div
                    key="remaining"
                    className={`flex flex-col mb-5 ${animationClass}`}
                  >
                    <span className="text-foreground/60 text-sm flex items-center gap-2">
                      <CalendarClock size={16} />
                      <span>Remaining</span>
                    </span>
                    <span className="text-foreground font-semibold text-3xl">
                      10 days
                    </span>
                    <span className="text-[--ui-primary] text-sm font-semibold">
                      47.6%
                    </span>
                  </div>
                ) : (
                  <div
                    key="completed"
                    className={`flex flex-col mb-5 ${animationClass}`}
                  >
                    <span className="text-foreground/60 text-sm flex items-center gap-2">
                      <CalendarCheck2 size={16} />
                      <span>Completed</span>
                    </span>
                    <span className="text-foreground font-semibold text-3xl">
                      11 days
                    </span>
                    <span className="text-[--ui-primary] text-sm font-semibold">
                      52.3%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-5 text-end justify-end items-center sm:items-end sm:w-auto">
                <div className="flex flex-col items-center justify-center w-full md:justify-end sm:items-end">
                  <span className="flex justify-end items-center text-foreground/60 text-sm  gap-2">
                    <Link2 size={16} />
                    <span>habits</span>
                  </span>
                  <span className="text-foreground font-bold text-xl">
                    <span>No sugar challenge</span>
                  </span>
                </div>
                <div className="flex gap-3 sm:gap-5 items-center">
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                </div>
                <div className="flex gap-3 sm:gap-5 items-center">
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-[--ui-primary-opacity] rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 relative sm:w-9 sm:h-9 bg-[--ui-primary] rounded-full transition duration-300 p-3"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                </div>
                <div className="flex gap-3 sm:gap-5 items-center">
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                  <div className="w-6 h-6 sm:w-9 sm:h-9 bg-foreground/10 rounded-full transition duration-300"></div>
                </div>
                <div className="flex items-center space-x-2 mt-5 justify-end">
                  <Switch
                    id="check-remaining"
                    onCheckedChange={handleSwitchChange}
                    aria-label="Show remaining days"
                  />
                  <Label htmlFor="check-remaining">
                    Show remaining
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-8 gap-8 justify-center lg:flex-row">
          {/* ===== START: REPLACEMENT ===== */}
          <div className="w-full lg:w-2/3">
            <ChatAnimation />
          </div>
          {/* ===== END: REPLACEMENT ===== */}
          <div className="flex flex-col items-center w-full bg-card -auto border border-border rounded-xl p-6 md:p-8 lg:w-1/3 md:items-start">
            <p className="text-center text-foreground/60 text-lg md:text-start">
              <span className="text-inverted font-bold">
                Customize
              </span>{' '}
              your directories look and feel the way you want
              including color theme and more.
            </p>
            <div className="flex gap-5 items-center mt-4">
              <span className="text-md font-semibold">
                Color theme
              </span>
              <ColorThemeSelector
                selectedColor={colorTheme}
                onSelectColor={setColorTheme}
              />
            </div>

            <div className="mt-3">
              <span className="flex items-center gap-2 mt-2">
                <Check size={16} />
                <span className="text-foreground/60 text-sm">
                  Analyze your progress
                </span>
              </span>
              <span className="flex items-center gap-2 mt-2">
                <Check size={16} />
                <span className="text-foreground/60 text-sm">
                  Get tips on how to improve focus
                </span>
              </span>
              <span className="flex items-center gap-2 mt-2">
                <Check size={16} />
                <span className="text-foreground/60 text-sm">
                  Identify your most productive times
                </span>
              </span>
              <span className="flex items-center gap-2 mt-2">
                <Check size={16} />
                <span className="text-foreground/60 text-sm">
                  Get suggestions for your workflow
                </span>
              </span>
              <span className="flex items-center gap-2 mt-2">
                <Check size={16} />
                <span className="text-foreground/60 text-sm">
                  Receive motivational feedback
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Wide>
  );
}

export default Cards;

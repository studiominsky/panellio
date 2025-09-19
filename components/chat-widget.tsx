'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  X,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Maximize2,
  Sparkles, // Import Sparkles for the upgrade button
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTimeFormat } from '@/context/time-format-context';
import { useAuth } from '@/context/auth-context';
import { useData } from '@/context/data-context';
import { useChat } from 'ai/react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  AlarmClockCheck,
  CalendarCheck,
  GraduationCap,
} from 'lucide-react';
import { usePlan } from '@/hooks/use-plan'; // 1. Import the plan hook
import Link from 'next/link';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY;
const DEFAULT_CITY = 'Vienna';
const ACTIVE_TIME = 25 * 60;
const PAUSE_TIME = 5 * 60;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [time, setTime] = useState(ACTIVE_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<'idle' | 'active' | 'pause'>(
    'idle'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialMessageSet, setInitialMessageSet] = useState(false);
  const [usedPrompts, setUsedPrompts] = useState<string[]>([]); // For click-once logic

  const { user } = useAuth();
  const { plan } = usePlan(); // 2. Use the plan hook
  const { directories, tasks, events, habits, dailies } = useData();

  const widgetRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio('/sounds/notification.mp3'));
  const inputRef = useRef<HTMLInputElement>(null);

  const isMobile = useMediaQuery('(max-width: 540px)');

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    append,
    isLoading,
  } = useChat({
    api: '/api/chat',
    body: {
      directories,
      tasks,
      events,
      habits,
      dailies,
      userId: user?.uid,
    },
  });

  const canUseFreeformInput = plan.limits.hasFreeformAi;

  useEffect(() => {
    if (user && !initialMessageSet && messages.length <= 1) {
      setMessages([
        {
          id: 'welcome-message',
          role: 'assistant',
          content: `Hi ${
            user.displayName || user.email
          }. How can I assist you?`,
        },
      ]);
      setInitialMessageSet(true);
    }
  }, [user, initialMessageSet, setMessages, messages.length]);

  const handleAnimationStart = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isRunning && time > 0) {
      timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    } else if (isRunning && time === 0) {
      audioRef.current
        .play()
        .catch((error) => console.error('Audio play error:', error));
      if (state === 'active') {
        setState('pause');
        setTime(PAUSE_TIME);
      } else {
        setState('active');
        setTime(ACTIVE_TIME);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, time, state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleBadgeClick = (prompt: string) => {
    if (usedPrompts.includes(prompt) || isLoading) return;

    append({
      content: prompt,
      role: 'user',
    });
    setUsedPrompts([...usedPrompts, prompt]);
  };

  const openDimensions = {
    width: isMobile ? 'calc(100vw - 32px)' : 520,
    height: isMobile ? '75vh' : 620,
  };

  const widgetsRow = (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
      <ClockWidget userLocation={user?.location || DEFAULT_CITY} />
      <WeatherWidget userLocation={user?.location || DEFAULT_CITY} />
      <PomodoroWidget
        time={time}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        setTime={setTime}
        formatTime={formatTime}
        state={state}
        setState={setState}
      />
    </div>
  );

  const chatUI = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3 pb-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[85%] bg-card border border-border text-foreground`}
                >
                  {m.role === 'user' ? (
                    <p className="text-sm">{m.content}</p>
                  ) : (
                    <div
                      className="text-start text-sm whitespace-pre-line leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: m.content
                          .replace(/\n/g, '<br/>')
                          .replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong>$1</strong>'
                          ),
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-3">
        {/* --- CONDITIONAL INPUT --- */}
        {canUseFreeformInput ? (
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 items-center"
          >
            <Input
              ref={inputRef}
              className="flex-1 p-2 rounded-lg border border-border bg-card h-9"
              value={input}
              placeholder="Type your message..."
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
            >
              Send
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <Link href="/subscription">
              <Button variant="outline" className="w-full h-9">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Premium to ask anything
              </Button>
            </Link>
          </div>
        )}

        <div className="flex gap-2 flex-wrap mt-3">
          <Button
            variant="emoji"
            size="sm"
            className="h-auto transition-transform duration-150 hover:scale-105 mb-1 max-w-fit py-1 px-2.5 rounded-full border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() =>
              handleBadgeClick('List my highest priority tasks')
            }
            disabled={
              usedPrompts.includes(
                'List my highest priority tasks'
              ) || isLoading
            }
          >
            Priority tasks{' '}
            <AlarmClockCheck className="w-3 h-3 ml-1" />
          </Button>
          <Button
            variant="emoji"
            size="sm"
            className="h-auto transition-transform duration-150 hover:scale-105 mb-1 max-w-fit py-1 px-2.5 rounded-full border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() =>
              handleBadgeClick(
                'Give me some advice on how to improve my productivity'
              )
            }
            disabled={
              usedPrompts.includes(
                'Give me some advice on how to improve my productivity'
              ) || isLoading
            }
          >
            Get advice <GraduationCap className="w-3 h-3 ml-1" />
          </Button>
          <Button
            variant="emoji"
            size="sm"
            className="h-auto transition-transform duration-150 hover:scale-105 mb-1 max-w-fit py-1 px-2.5 rounded-full border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() =>
              handleBadgeClick(
                'Help me organize my schedule and tasks'
              )
            }
            disabled={
              usedPrompts.includes(
                'Help me organize my schedule and tasks'
              ) || isLoading
            }
          >
            Organize <CalendarCheck className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/80 z-40 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      <div
        ref={widgetRef}
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="relative bg-background rounded-2xl border border-border"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                width: openDimensions.width,
                height: openDimensions.height,
              }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 25,
              }}
            >
              <Card className="w-full h-full p-1 overflow-hidden bg-transparent">
                <div className="w-full h-full p-4 flex flex-col gap-4 pb-8">
                  {widgetsRow}
                  <div className="relative flex-1 border border-border rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      onClick={() => setIsFullscreen(true)}
                      className="absolute right-1 top-1 p-1 text-foreground/70 z-10"
                      size="sm"
                      aria-label="Open Fullscreen"
                    >
                      <Maximize2 size={14} />
                    </Button>
                    <div className="p-3 h-full">{chatUI}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className={`absolute bottom-[-10px] right-0 z-10 ${
            isRunning
              ? state === 'active'
                ? 'bg-red-800 hover:bg-red-900'
                : 'bg-green-800 hover:bg-green-900'
              : 'bg-background'
          } outline outline-1 outline-border rounded-full flex items-center justify-center cursor-pointer hover:bg-muted duration-300`}
          style={{ width: 62, height: 62 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <X
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isRunning ? 'text-white' : ''
                  }`}
                />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                className="flex items-center justify-center gap-1 h-full w-full"
                initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {!isRunning && (
                  <LayoutGrid className="w-5 h-5 text-primary" />
                )}
                {isRunning && (
                  <span className="text-md font-semibold text-white">
                    {formatTime(time)}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton
          fullscreen
          className="h-[90vh] flex flex-col p-4 sm:p-6 rounded-lg"
        >
          <DialogTitle className="sr-only">
            AI Assistant Fullscreen
          </DialogTitle>
          {chatUI}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ... (PomodoroWidget, WeatherWidget, and ClockWidget components remain the same)
function PomodoroWidget({
  time,
  isRunning,
  setIsRunning,
  setTime,
  formatTime,
  state,
  setState,
}: {
  time: number;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  setTime: (value: number) => void;
  formatTime: (seconds: number) => string;
  state: 'idle' | 'active' | 'pause';
  setState: (value: 'idle' | 'active' | 'pause') => void;
}) {
  const handleStop = () => {
    setIsRunning(false);
    setTime(ACTIVE_TIME);
    setState('idle');
  };

  const handleStartPause = () => {
    if (!isRunning && state === 'idle') {
      setState('active');
    }
    setIsRunning(!isRunning);
  };

  return (
    <Card className="h-full p-3 text-center bg-card border border-border rounded-md flex flex-col justify-between">
      <h3 className="text-sm font-semibold text-foreground">
        {state === 'idle'
          ? 'Pomodoro'
          : state === 'active'
            ? 'Focus'
            : 'Break'}
      </h3>
      <p className="text-lg font-bold text-foreground">
        {formatTime(time)}
      </p>
      <div className="flex justify-center gap-1 mt-1">
        <Button
          variant="primary"
          onClick={handleStartPause}
          className="px-2 py-0.5 text-white rounded-md text-xs h-7"
          size="sm"
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          disabled={state === 'idle'}
          variant="destructive"
          onClick={handleStop}
          className="px-2 py-0.5 text-xs h-7"
          size="sm"
        >
          Stop
        </Button>
      </div>
    </Card>
  );
}

function WeatherWidget({ userLocation }: { userLocation: string }) {
  const [weather, setWeather] = useState({
    temp: '--',
    condition: 'Loading...',
    icon: <Cloud className="w-6 h-6 text-muted-foreground" />,
  });

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            userLocation
          )}&units=metric&appid=${WEATHER_API_KEY}`
        );
        if (!response.ok) {
          throw new Error('Location not found');
        }
        const data = await response.json();
        const condition = data.weather[0].main.toLowerCase();
        let icon;

        switch (condition) {
          case 'clear':
            icon = <Sun className="w-6 h-6 text-yellow-500" />;
            break;
          case 'clouds':
            icon = (
              <Cloud className="w-6 h-6 text-muted-foreground" />
            );
            break;
          case 'rain':
            icon = <CloudRain className="w-6 h-6 text-blue-500" />;
            break;
          case 'snow':
            icon = <CloudSnow className="w-6 h-6 text-blue-300" />;
            break;
          case 'thunderstorm':
            icon = (
              <CloudLightning className="w-6 h-6 text-yellow-600" />
            );
            break;
          case 'fog':
          case 'mist':
            icon = <CloudFog className="w-6 h-6 text-gray-400" />;
            break;
          default:
            icon = (
              <Cloud className="w-6 h-6 text-muted-foreground" />
            );
            break;
        }

        setWeather({
          temp: Math.round(data.main.temp).toString(),
          condition: data.weather[0].description,
          icon,
        });
      } catch (error) {
        setWeather({
          temp: '--',
          condition: 'Location not found',
          icon: <Cloud className="w-6 h-6 text-muted-foreground" />,
        });
      }
    }

    fetchWeather();
  }, [userLocation]);

  return (
    <Card className="h-full p-3 text-center bg-card border border-border rounded-md flex flex-col justify-center">
      <h3 className="text-sm font-semibold text-foreground truncate">
        {userLocation}
      </h3>
      <div className="flex justify-center items-center gap-1">
        {weather.icon}
        <p className="text-lg font-bold text-foreground">
          {weather.temp}°C
        </p>
      </div>
      <p className="text-xs text-muted-foreground capitalize mt-1 truncate">
        {weather.condition}
      </p>
    </Card>
  );
}

function ClockWidget({ userLocation }: { userLocation: string }) {
  const [time, setTime] = useState(new Date());
  const { timeFormat } = useTimeFormat();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTimeDisplay = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  };

  return (
    <Card className="h-full p-3 text-center bg-card border border-border rounded-md flex flex-col justify-center">
      <p className="text-2xl font-bold text-foreground">
        {formatTimeDisplay(time)}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatDate(time)}
      </p>
    </Card>
  );
}

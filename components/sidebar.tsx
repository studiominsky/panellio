'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
import {
  AlarmClockCheck,
  CalendarCheck,
  GraduationCap,
} from 'lucide-react';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY;
const DEFAULT_CITY = 'Vienna';
const ACTIVE_TIME = 25 * 60;
const PAUSE_TIME = 5 * 60;

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [time, setTime] = useState(ACTIVE_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<'idle' | 'active' | 'pause'>(
    'idle'
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialMessageSet, setInitialMessageSet] = useState(false);

  const { user } = useAuth();
  const {
    directories,
    tasks,
    events,
    habits,
    dailies,
    fetchAllData,
  } = useData();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef(new Audio('/sounds/notification.mp3'));
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
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

  useEffect(() => {
    if (user && !initialMessageSet) {
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
      fetchAllData();
    }
  }, [user, initialMessageSet, setMessages, fetchAllData]);

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
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
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
    const fakeInputEvent = { target: { value: prompt } } as any;
    handleInputChange(fakeInputEvent);
    inputRef.current?.focus();
  };

  const widgetsRow = (
    <div className="grid grid-cols-3 gap-3 mb-4">
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
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 items-center"
        >
          <Input
            ref={inputRef}
            className="flex-1 p-2 rounded-lg border border-border bg-card"
            value={input}
            placeholder="Type your message..."
            onChange={handleInputChange}
          />
          <Button type="submit" variant="primary" size="sm">
            Send
          </Button>
        </form>

        <div className="flex gap-2 flex-wrap mt-3">
          <Badge
            variant="outline"
            className="cursor-pointer transition-transform duration-150 hover:scale-105 max-w-fit py-1 border-none bg-[--ui-primary] bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
            onClick={() =>
              handleBadgeClick('List my highest priority tasks')
            }
          >
            Priority tasks{' '}
            <AlarmClockCheck className="w-3 h-3 ml-1" />
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer transition-transform duration-150 hover:scale-105 max-w-fit py-1 border-none bg-[--ui-primary] bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
            onClick={() =>
              handleBadgeClick(
                'Give me some advice on how to improve my productivity'
              )
            }
          >
            Get advice <GraduationCap className="w-3 h-3 ml-1" />
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer transition-transform duration-150 hover:scale-105 max-w-fit py-1 border-none bg-[--ui-primary] bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
            onClick={() =>
              handleBadgeClick(
                'Help me organize my schedule and tasks'
              )
            }
          >
            Organize <CalendarCheck className="w-3 h-3 ml-1" />
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`relative bg-background rounded-2xl ${
        isOpen ? 'border border-border' : ''
      }`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/80 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      <div
        ref={sidebarRef}
        className="fixed bottom-6 right-6 z-50 rounded-2xl"
      >
        <motion.div
          className={`relative bg-background rounded-2xl ${
            isOpen ? 'border border-border' : ''
          }`}
          initial={{ width: 56, height: 56 }}
          animate={{
            width: isOpen ? 520 : 56,
            height: isOpen ? 620 : 56,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          onAnimationStart={handleAnimationStart}
          onAnimationComplete={handleAnimationComplete}
        >
          <Card className="w-full h-full p-1 overflow-hidden bg-transparent">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.1,
                    ease: 'easeOut',
                  }}
                  className="w-full h-full p-4 flex flex-col gap-4 pb-8"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
        <motion.div
          className={`absolute bottom-2 right-2 z-10 ${
            isRunning
              ? state === 'active'
                ? 'bg-red-800 hover:bg-red-900 outline-0'
                : 'bg-green-800 hover:bg-green-900 outline-o'
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
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent
            showCloseButton
            className="min-w-[90%] min-h-[80%] flex flex-col p-6 rounded-lg h-[90vh]"
          >
            <DialogTitle></DialogTitle>
            {chatUI}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Rest of the components (PomodoroWidget, WeatherWidget, ClockWidget) remain unchanged
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

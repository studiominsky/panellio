'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useData } from '@/context/data-context';
import { useChat } from 'ai/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';
import {
  AlarmClockCheck,
  CalendarCheck,
  GraduationCap,
  Maximize2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AIAssistant() {
  const {
    directories,
    tasks,
    events,
    habits,
    dailies,
    fetchAllData,
  } = useData();
  const { user } = useAuth();

  const [initialMessageSet, setInitialMessageSet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleBadgeClick = (prompt: string) => {
    const fakeInputEvent = { target: { value: prompt } } as any;
    handleInputChange(fakeInputEvent);
    inputRef.current?.focus();
  };

  const chatUI = (
    <>
      <ScrollArea className="flex-1 overflow-y-auto pr-6">
        <div className="space-y-4 pb-20">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-[70%] bg-card border border-border text-inverted`}
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

      <form
        onSubmit={handleSubmit}
        className="flex gap-4 items-center mt-3 pr-6"
      >
        <Input
          ref={inputRef}
          className="flex-1 p-4 rounded-lg border border-border bg-card"
          value={input}
          placeholder="Type your message..."
          onChange={handleInputChange}
        />
        <Button type="submit" className="p-4" variant="primary">
          Send
        </Button>
      </form>

      <div className="flex gap-3 flex-wrap mt-4">
        <Badge
          variant="outline"
          className="cursor-pointer transition-transform duration-150 hover:scale-105 mb-1 max-w-fit py-1 border-none bg-[--ui-primary] bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          onClick={() =>
            handleBadgeClick('List my highest priority tasks')
          }
        >
          List priority tasks{' '}
          <AlarmClockCheck className="w-4 h-4 ml-2" />
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer transition-transform duration-150 hover:scale-105 mb-1 max-w-fit py-1 border-none bg-[--ui-primary] bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          onClick={() =>
            handleBadgeClick(
              'Give me some advice on how to improve my productivity'
            )
          }
        >
          Get advice <GraduationCap className="w-4 h-4 ml-2" />
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer transition-transform duration-150 hover:scale-105 mb-1 max-w-fit py-1 border-none bg-[--ui-primary] bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          onClick={() =>
            handleBadgeClick('Help me organize my schedule and tasks')
          }
        >
          Help me organize <CalendarCheck className="w-4 h-4 ml-2" />
        </Badge>
      </div>
    </>
  );

  return (
    <div className="relative">
      <div className="flex flex-col ml-auto h-[420px] max-h-[420px] w-full overflow-hidden p-6 pr-0 bg-card border border-border rounded-lg">
        <Button
          variant="ellipsis"
          onClick={() => setIsFullscreen(true)}
          className="absolute right-0 top-0 p-4 text-foreground/70"
          aria-label="Open Fullscreen"
        >
          <Maximize2 size={15} />
        </Button>
        {chatUI}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton
          className="min-w-[90%] min-h-[80%] flex flex-col p-6 rounded-t-lg rounded-b-none h-[90vh] overflow-y-auto"
        >
          <DialogTitle></DialogTitle>
          {chatUI}
        </DialogContent>
      </Dialog>
    </div>
  );
}

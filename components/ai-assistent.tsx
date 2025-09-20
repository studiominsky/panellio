'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useData } from '@/context/data-context';
import { useChat } from 'ai/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlarmClockCheck,
  CalendarCheck,
  GraduationCap,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePlan } from '@/hooks/use-plan';
import Link from 'next/link';
import { ColorThemeProvider } from '@/providers/color-theme-provider';

export default function AIAssistant() {
  const { user } = useAuth();
  const { plan } = usePlan();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [usedPrompts, setUsedPrompts] = useState<string[]>([]);

  const { directories, tasks, events, habits, dailies } = useData();

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
    },
  });

  const [initialMessageSet, setInitialMessageSet] = useState(false);

  const canUseFreeformInput = plan?.limits.hasFreeformAi;

  useEffect(() => {
    if (user && !initialMessageSet && messages.length <= 1) {
      setMessages([
        {
          id: 'welcome-message',
          role: 'assistant',
          content: `Hi ${user.displayName || user.email}. How can I assist you?`,
        },
      ]);
      setInitialMessageSet(true);
    }
  }, [user, initialMessageSet, setMessages, messages.length]);

  const handleBadgeClick = (prompt: string) => {
    if (usedPrompts.includes(prompt) || isLoading) return;

    append({
      content: prompt,
      role: 'user',
    });
    setUsedPrompts([...usedPrompts, prompt]);
  };

  const chatUI = (
    <>
      <ScrollArea className="flex-1 overflow-y-auto pr-6">
        <div className="space-y-4 pb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[100%] sm:max-w-[70%] bg-card border border-border text-inverted`}
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

      {canUseFreeformInput ? (
        <form
          onSubmit={handleSubmit}
          className="flex gap-4 items-center mt-3 pr-6"
        >
          <Input
            className="flex-1 p-4 rounded-lg border border-border bg-card"
            value={input}
            placeholder="Type your message..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="p-4"
            variant="primary"
            disabled={isLoading}
          >
            Send
          </Button>
        </form>
      ) : (
        <div className="text-start p-2 mt-3 pr-6">
          <Link href="/subscription">
            <Button variant="outline" className="w-full text-start">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium to ask more
            </Button>
          </Link>
        </div>
      )}

      <div className="flex gap-3 flex-wrap mt-4 pr-6">
        <ColorThemeProvider className='flex flex-col sm:flex-row gap-2'>
          <Button
            variant="emoji"
            className="h-auto transition-transform duration-150 hover:scale-105 mb-1 max-w-fit py-1 px-2.5 rounded-full border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() =>
              handleBadgeClick('List my highest priority tasks')
            }
            disabled={
              usedPrompts.includes('List my highest priority tasks') ||
              isLoading
            }
          >
            List priority tasks{' '}
            <AlarmClockCheck className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="emoji"
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
            Get advice <GraduationCap className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="emoji"
            className="h-auto transition-transform duration-150 hover:scale-105 mb-1 max-w-fit py-1 px-2.5 rounded-full border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() =>
              handleBadgeClick('Help me organize my schedule and tasks')
            }
            disabled={
              usedPrompts.includes(
                'Help me organize my schedule and tasks'
              ) || isLoading
            }
          >
            Help me organize <CalendarCheck className="w-4 h-4 ml-2" />
          </Button>
        </ColorThemeProvider>

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

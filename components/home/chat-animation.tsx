'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlarmClockCheck,
  GraduationCap,
  CalendarCheck,
} from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

const chatScript: Message[] = [
  {
    id: 1,
    role: 'user',
    content: 'What are my top priority tasks for today?',
  },
  {
    id: 2,
    role: 'assistant',
    content:
      'You have 3 high-priority tasks:\n1. **Finalize the Q3 report.**\n2. **Prepare for the client presentation.**\n3. **Review the new project proposal.**',
  },
  {
    id: 3,
    role: 'user',
    content: 'Any tips on how to stay focused?',
  },
  {
    id: 4,
    role: 'assistant',
    content:
      'Certainly! Try the **Pomodoro Technique**: work in 25-minute focused intervals with short breaks. Also, consider turning off notifications to minimize distractions.',
  },
];

const TypingIndicator: React.FC = () => {
  return (
    <div
      className="flex items-center gap-2 p-3"
      role="status"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <span className="dot bg-[--ui-primary]" />
      <span className="dot dot-2 bg-[--ui-primary]" />
      <span className="dot dot-3 bg-[--ui-primary]" />
      <style jsx>{`
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          display: inline-block;
          animation: dot-bounce 1.2s infinite ease-in-out both;
        }
        .dot-2 {
          animation-delay: 50ms;
        }
        .dot-3 {
          animation-delay: 200ms;
        }
        @keyframes dot-bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
};

function useTypewriter(
  fullText: string,
  enabled: boolean,
  speed = 15
) {
  const [typedText, setTypedText] = useState('');
  useEffect(() => {
    if (!enabled) {
      setTypedText(fullText);
      return;
    }

    setTypedText('');
    const chars = Array.from(fullText);
    let i = 0;
    const timer = setInterval(() => {
      if (i < chars.length) {
        setTypedText((prev) => prev + chars[i]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [fullText, enabled, speed]);

  return typedText;
}

export function ChatAnimation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const lastMessage = messages[messages.length - 1];
  const isLastMessageAssistant = lastMessage?.role === 'assistant';
  const enableTypewriter = isLastMessageAssistant && !isTyping;
  const typedContent = useTypewriter(
    isLastMessageAssistant ? lastMessage.content : '',
    enableTypewriter
  );

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    );
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [messages, isTyping, typedContent]);

  useEffect(() => {
    let idx = 0;
    const timeouts: NodeJS.Timeout[] = [];

    const playNextMessage = () => {
      if (idx >= chatScript.length) {
        return;
      }

      const nextMessage = chatScript[idx];
      const isAssistant = nextMessage.role === 'assistant';

      if (isAssistant) {
        timeouts.push(setTimeout(() => setIsTyping(true), 300));
      }

      const baseDelay = isAssistant ? 1000 : 500;
      const contentDelay = Math.min(
        1500,
        nextMessage.content.length * 10
      );

      timeouts.push(
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, nextMessage]);
          idx++;
          playNextMessage();
        }, baseDelay + contentDelay)
      );
    };

    setMessages([]);
    setIsTyping(false);
    playNextMessage();

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const badgeContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.5,
      },
    },
  };

  const badgeItemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="flex flex-col w-full bg-card border border-border rounded-xl p-6 md:p-8 h-[420px] overflow-hidden">
      <p className="text-foreground/60 text-center text-lg md:max-w-[60%] md:text-start flex-shrink-0">
        <span className="text-inverted font-bold">
          Gain AI-powered insights
        </span>{' '}
        that will motivate you to finish your tasks and stay on track.
      </p>

      <div className="flex-1 mt-6 rounded-lg bg-background/50 -mx-3 -mb-3 sm:p-3 overflow-hidden">
        <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
          <div className="space-y-3 pb-4 pr-4">
            {messages.map((m, i) => {
              const isUser = m.role === 'user';
              const isLastAssistant =
                i === messages.length - 1 && m.role === 'assistant';

              return (
                <div
                  key={m.id}
                  className={cn(
                    'flex animate-in fade-in-0 slide-in-from-bottom-2.5 duration-300',
                    isUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-[85%] border text-foreground',
                      isUser
                        ? 'bg-[--ui-primary-opacity] text-primary-foreground border-transparent'
                        : 'bg-card border-border'
                    )}
                  >
                    <div
                      className="text-start text-sm whitespace-pre-line leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: (isLastAssistant
                          ? typedContent
                          : m.content
                        ).replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong>$1</strong>'
                        ),
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start animate-in fade-in-0 duration-100">
                <div className="bg-card rounded-lg">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="flex gap-3 flex-wrap mt-4">
        <Badge
          variant="outline"
          className="mb-1 max-w-fit py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
        >
          List priority tasks{' '}
          <AlarmClockCheck className="w-4 h-4 ml-2" />
        </Badge>
        <Badge
          variant="outline"
          className="mb-1 max-w-fit py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
        >
          Get advice <GraduationCap className="w-4 h-4 ml-2" />
        </Badge>
        <Badge
          variant="outline"
          className="mb-1 max-w-fit py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
        >
          Help me organize <CalendarCheck className="w-4 h-4 ml-2" />
        </Badge>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { merge } from '@/utils/merge-classes';
import { TagsInput } from '@/components/ui/tags-input';
import { useTheme } from 'next-themes';

interface CreateStickyNoteFormProps {
  onClose: () => void;
  onCreate: (payload: {
    text: string;
    color: string;
    tags?: string[];
  }) => void;
}

const COLORS = ['blue', 'green', 'orange', 'neutral'];

const themeClassMapping: Record<string, string> = {
  blue: 'color-theme-blue',
  green: 'color-theme-green',
  orange: 'color-theme-orange',
  neutral: '',
};

export default function CreateStickyNoteForm({
  onClose,
  onCreate,
}: CreateStickyNoteFormProps) {
  const [text, setText] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const { theme } = useTheme();

  const handleSubmit = () => {
    if (!text.trim()) return;
    onCreate({ text, color, tags });
  };

  return (
    <div>
      <Label className="mt-4 mb-2 block text-sm font-medium text-muted-foreground">
        Sticky Note Text
      </Label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
      />

      <Label className="mt-4 mb-2 block text-sm font-medium text-muted-foreground">
        Tags
      </Label>
      <TagsInput
        value={tags}
        onChange={setTags}
        placeholder="Type to add tags..."
      />

      <div className="flex gap-2 items-center justify-between mt-4">
        <Label className="block text-sm font-medium text-muted-foreground">
          Sticky Note Color
        </Label>
        <div className="flex gap-2 items-center">
          {COLORS.map((c) => {
            const checkColorClass =
              c === 'neutral'
                ? 'text-inverted'
                : theme === 'dark'
                ? 'text-white'
                : 'text-background';

            return (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="flex items-center justify-center w-8 h-8 rounded-full"
              >
                <div
                  className={merge(
                    'w-5 h-5 rounded-full flex items-center justify-center',
                    c === 'neutral'
                      ? 'w-[1.375rem] h-[1.375rem] border border-border bg-transparent'
                      : themeClassMapping[c]
                  )}
                  style={{
                    backgroundColor:
                      c === 'blue'
                        ? 'var(--blue-600)'
                        : c === 'green'
                        ? 'var(--green-600)'
                        : c === 'orange'
                        ? 'var(--orange-600)'
                        : 'transparent',
                  }}
                >
                  {color === c && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[--theme-primary]">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={merge('h-4 w-4', checkColorClass)}
                      >
                        <path
                          d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button
          variant="default"
          className="w-full"
          onClick={handleSubmit}
        >
          Create
        </Button>
      </div>
    </div>
  );
}

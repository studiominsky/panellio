import { CircleX } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ColorThemeProvider } from '@/providers/color-theme-provider';

export interface Tag {
  value: string;
  label: string;
}

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  value,
  onChange,
  placeholder = 'Add a tag...',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      (e.key === 'Enter' || e.key === ' ' || e.key === ',') &&
      inputValue.trim()
    ) {
      addTag(inputValue);
      e.preventDefault();
    }
    if (e.key === 'Backspace' && !inputValue) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      <ColorThemeProvider className="flex flex-wrap gap-1">
        {value.map((tag) => (
          <div
            key={tag}
            className="flex items-center rounded-full border px-2.5 text-xs font-semibold mb-1 py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-muted-foreground hover:scale-125 duration-300 focus:outline-none"
            >
              <CircleX
                size={14}
                className="text-black dark:text-[--ui-primary]"
              />
            </button>
          </div>
        ))}
      </ColorThemeProvider>

      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
};

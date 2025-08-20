'use client';

import React from 'react';
import { DailyBlock } from '@/types/daily-types';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, Circle } from 'lucide-react';

interface DailyBlockListProps {
  blocks: DailyBlock[];
  onEditBlock: (block: DailyBlock) => void;
  onDeleteBlock: (blockName: string) => void;
  onToggleBlockCompletion: (block: DailyBlock) => void;
}

export default function DailyBlockList({
  blocks,
  onEditBlock,
  onDeleteBlock,
  onToggleBlockCompletion,
}: DailyBlockListProps) {
  if (blocks.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No blocks added yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {blocks.map((block) => (
        <li
          key={block.name}
          className="flex justify-between items-center"
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleBlockCompletion(block)}
              className="focus:outline-none"
            >
              {block.completed ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <Circle size={20} className="text-gray-500" />
              )}
            </button>
            <div>
              <p className="font-medium">{block.name}</p>
              <p className="text-sm text-muted-foreground">
                {block.startTime} - {block.endTime}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditBlock(block)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteBlock(block.name)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { DailyBlock } from '@/types/daily-types';
import { parseTimeToMinutes, formatTime } from '@/lib/time';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Ellipsis, Trash2, Edit2 } from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateEditBlockForm from './create-edit-block-form';
import { useTimeFormat } from '@/context/time-format-context';
import {
  getGradientFromColorName,
  colorMapping,
} from '@/lib/color-utils';

interface DayTimetableProps {
  blocks: DailyBlock[];
  startTime: string;
  endTime: string;
  onBlockUpdate: (updatedBlock: DailyBlock) => void;
  onBlockDelete: (blockId: string) => void;
}

const getBlockGradientBackground = (block: DailyBlock): string => {
  return getGradientFromColorName(block.color ? block.color : 'blue');
};

export default function DayTimetable({
  blocks,
  startTime,
  endTime,
  onBlockUpdate,
  onBlockDelete,
}: DayTimetableProps) {
  const { timeFormat } = useTimeFormat();
  const startMinutes = parseTimeToMinutes(startTime) ?? 0;
  const endMinutes = parseTimeToMinutes(endTime) ?? 0;
  const totalMinutes = endMinutes - startMinutes;

  const TIMETABLE_WIDTH = 1000;
  const BLOCK_HEIGHT = 60;
  const interval = 5;
  const cols = Math.ceil(totalMinutes / interval);
  const intervalWidth = TIMETABLE_WIDTH / cols;

  const generateLayout = (): Layout[] =>
    blocks.map((block) => {
      const blockStart =
        (parseTimeToMinutes(block.startTime) ?? 0) - startMinutes;
      const blockEnd =
        (parseTimeToMinutes(block.endTime) ?? 0) - startMinutes;
      const x = Math.floor(blockStart / interval);
      const w = Math.ceil((blockEnd - blockStart) / interval);
      return {
        i: block.id,
        x,
        y: 0,
        w,
        h: 1,
        isResizable: true,
        isDraggable: true,
      };
    });

  const [layout, setLayout] = useState<Layout[]>(generateLayout());
  const [selectedBlock, setSelectedBlock] =
    useState<DailyBlock | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] =
    useState<DailyBlock | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setLayout(generateLayout());
  }, [blocks, timeFormat, startMinutes, interval]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    const updatedBlocks: DailyBlock[] = [];
    newLayout.forEach((item) => {
      const block = blocks.find((b) => b.id === item.i);
      if (!block) return;
      const newStart = startMinutes + item.x * interval;
      const newEnd = newStart + item.w * interval;
      const updatedBlock = {
        ...block,
        startTime: formatTime(
          Math.floor(newStart / 60),
          newStart % 60,
          timeFormat
        ),
        endTime: formatTime(
          Math.floor(newEnd / 60),
          newEnd % 60,
          timeFormat
        ),
      };
      if (
        updatedBlock.startTime !== block.startTime ||
        updatedBlock.endTime !== block.endTime
      ) {
        updatedBlocks.push(updatedBlock);
      }
    });
    updatedBlocks.forEach((updatedBlock) =>
      onBlockUpdate(updatedBlock)
    );
  };

  const handleEditClick = (block: DailyBlock) => {
    setSelectedBlock(block);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (block: DailyBlock) => {
    setBlockToDelete(block);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveBlock = (updatedBlock: DailyBlock) => {
    onBlockUpdate(updatedBlock);
    setIsEditDialogOpen(false);
    setSelectedBlock(null);
  };

  return (
    <div
      className="day-timetable"
      style={{
        width: `${TIMETABLE_WIDTH}px`,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div
        className="hour-labels"
        style={{
          display: 'flex',
          width: `${TIMETABLE_WIDTH}px`,
          height: '30px',
          boxSizing: 'border-box',
          position: 'relative',
          color: '#505050',
        }}
      >
        {Array.from(
          { length: Math.ceil(totalMinutes / 60) + 1 },
          (_, i) => {
            const time = startMinutes + i * 60;
            const x = Math.floor((time - startMinutes) / interval);
            return (
              <div
                key={i}
                className="text-foreground/40"
                style={{
                  position: 'absolute',
                  left: `${x * intervalWidth}px`,
                  width: `${intervalWidth * (60 / interval)}px`,
                  textAlign: 'start',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              >
                {formatTime(
                  Math.floor(time / 60),
                  time % 60,
                  timeFormat
                )}
              </div>
            );
          }
        )}
      </div>

      <GridLayout
        className="timetable-grid"
        layout={layout}
        cols={cols}
        rowHeight={BLOCK_HEIGHT}
        width={TIMETABLE_WIDTH}
        margin={[0, 20]}
        containerPadding={[0, 0]}
        compactType={null}
        preventCollision={false}
        onDragStop={handleLayoutChange}
        onResizeStop={handleLayoutChange}
        isResizable
        resizeHandles={['e', 'w']}
        isDraggable
      >
        {blocks.map((block) => (
          <div
            key={block.id}
            className="timetable-block"
            style={{
              background: getBlockGradientBackground(block),
              display: 'flex',
              alignItems: 'start',
              position: 'relative',
              height: `${BLOCK_HEIGHT}px`,
              borderRadius: '4px',
              padding: '0',
              boxSizing: 'border-box',
              flexDirection: 'column',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                backgroundColor: `var(--${
                  block.color?.toLowerCase() ?? 'blue'
                }-400)`,
              }}
              className="absolute h-full w-[7px] rounded-l"
            />
            <div
              className="ml-4 mt-2 font-medium block-time text-xs text-foreground/90"
              style={{ marginRight: '8px' }}
            >
              {formatTime(
                Math.floor(
                  (parseTimeToMinutes(block.startTime) ?? 0) / 60
                ),
                (parseTimeToMinutes(block.startTime) ?? 0) % 60,
                timeFormat
              )}{' '}
              -{' '}
              {formatTime(
                Math.floor(
                  (parseTimeToMinutes(block.endTime) ?? 0) / 60
                ),
                (parseTimeToMinutes(block.endTime) ?? 0) % 60,
                timeFormat
              )}
            </div>
            <span className="ml-4 text-sm mt-1">
              {block.name || 'Unnamed Block'}
            </span>
            <div className="absolute right-1 top-0">
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger
                    asChild
                    variant="ellipsis"
                    className="h-auto bg-transparent p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Ellipsis size={28} />
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem
                      onClick={() => handleEditClick(block)}
                    >
                      <Edit2 size={14} className="mr-2" />
                      Edit Block
                    </MenubarItem>
                    <MenubarItem
                      onClick={() => handleDeleteClick(block)}
                      className="text-red-500"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete Block
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>
          </div>
        ))}
      </GridLayout>

      {/* Edit Block Dialog */}
      {selectedBlock && (
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) setSelectedBlock(null);
            setIsEditDialogOpen(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Time Block</DialogTitle>
              <DialogDescription>
                Modify the details of the selected time block.
              </DialogDescription>
            </DialogHeader>
            <CreateEditBlockForm
              initialBlock={selectedBlock}
              onSave={handleSaveBlock}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedBlock(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Block</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the block{' '}
              {blockToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (blockToDelete) {
                  onBlockDelete(blockToDelete.id);
                  setIsDeleteDialogOpen(false);
                  setBlockToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

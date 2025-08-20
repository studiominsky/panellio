// components/sortable-item.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';

interface SortableItemProps {
  item: { id: string };
  children: React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

export default SortableItem;

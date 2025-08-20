'use client';

import { useEffect } from 'react';
import { ListFilesAndFolders } from '@/components/assets/list-files-and-folders';
import { DirectoryItem } from '@/types/directory-type';

interface AssetsComponentProps {
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
}

export default function AssetsComponent({
  directoryId,
  itemData: DirectoryItem,
  onDirectoryItemRemoved,
}: AssetsComponentProps) {
  useEffect(() => {}, [directoryId]);

  return (
    <ListFilesAndFolders
      directoryId={directoryId}
      onDirectoryItemRemoved={onDirectoryItemRemoved}
      itemData={DirectoryItem}
    />
  );
}

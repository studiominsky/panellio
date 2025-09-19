'use client';

import React, { useState } from 'react';
import { createDirectory } from '@/services/directory-service';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useDirectoryContext } from '@/context/dir-context';
import { Directory } from '@/types/directory-type';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Loader, Sparkles } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePlan } from '@/hooks/use-plan'; // 1. Import the plan hook
import Link from 'next/link';

interface CreateDirectoryFormProps {
  onClose: () => void;
}

export default function CreateDirectoryForm({
  onClose,
}: CreateDirectoryFormProps) {
  const { user } = useAuth();
  const { directories, addDirectory } = useDirectoryContext();
  const [directoryName, setDirectoryName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { plan } = usePlan();

  const router = useRouter();

  const atDirectoryLimit =
    directories.length >= plan.limits.directories;

  const handleCreateDirectory = async () => {
    if (atDirectoryLimit) {
      toast({
        title: 'Limit Reached',
        description:
          'You have reached your directory limit. Please upgrade.',
        variant: 'destructive',
      });
      return;
    }

    const trimmedName = directoryName.trim();

    if (!trimmedName) {
      toast({
        title: 'Directory name required',
        description: 'Please enter a directory name to proceed.',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !user.username) {
      toast({
        title: 'Error',
        description:
          'User is not authenticated or username is missing.',
        variant: 'destructive',
      });
      return;
    }

    if (
      directories.some(
        (dir) => dir.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      toast({
        title: 'Duplicate Name',
        description: `A directory with the name "${trimmedName}" already exists.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const slug = trimmedName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const getNextPosition = async (userId: string) => {
        const directoriesRef = collection(
          db,
          'users',
          userId,
          'directories'
        );
        const snapshot = await getDocs(directoriesRef);
        return snapshot.size;
      };

      const position = await getNextPosition(user.uid);

      const docRef = await createDirectory(
        user,
        trimmedName,
        description,
        position
      );

      const newDirectory: Directory = {
        id: docRef.id,
        name: trimmedName,
        slug,
        description,
        items: [],
        position,
      };

      addDirectory(newDirectory);

      toast({
        title: 'Directory created',
        description: `Directory "${trimmedName}" has been successfully created.`,
      });
      setDirectoryName('');
      setDescription('');

      router.push(`/${user.username}/${slug}`);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create directory.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isCreateDisabled = !directoryName.trim() || loading;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create a New Directory</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Create a new directory to organize your folders and
          features.
        </DialogDescription>
      </DialogHeader>

      {atDirectoryLimit ? (
        <div className="mt-4 text-center">
          <p className="text-sm font-bold text-destructive">
            You've reached your limit of {plan.limits.directories}{' '}
            directories.
          </p>
          <p className="text-sm text-muted-foreground">
            Please upgrade your plan to create more.
          </p>
          <Button className="text-background  justify-center mt-3">
            <Link
              href="/subscription"
              className="flex items-center gap-1"
            >
              <Sparkles size={14} /> Upgrade
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <Input
            type="text"
            placeholder="Directory Name"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            className="mt-4"
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-2 mt-4"
          />

          <Button
            onClick={handleCreateDirectory}
            disabled={isCreateDisabled}
            className={`w-full mt-4 ${
              isCreateDisabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:opacity-90'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Creating...
              </div>
            ) : (
              'Create Directory'
            )}
          </Button>
        </>
      )}
    </>
  );
}

// components/assets/upload-file.tsx

import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { uploadFile } from '@/services/assets-service';
import { toast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Loader } from 'lucide-react';
import { FileInput } from '../ui/file-input';
import { usePlan } from '@/hooks/use-plan';

interface UploadFileProps {
  directoryId: string;
  folderId: string;
  onClose: () => void;
  refreshList: () => void;
  existingFileNames?: string[];
}

export function UploadFile({
  directoryId,
  folderId,
  onClose,
  refreshList,
  existingFileNames = [],
}: UploadFileProps) {
  const { user } = useAuth();
  const { plan } = usePlan();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !plan) return;

    if (existingFileNames.includes(file.name)) {
      setIsDuplicate(true);
      toast({
        title: 'Error',
        description: 'A file with this name already exists',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await uploadFile(user, file, directoryId, folderId);
      toast({
        title: 'File uploaded',
        description: `File "${file.name}" has been successfully uploaded.`,
      });
      setFile(null);
      onClose();
      refreshList();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <FileInput type="file" onChange={handleFileChange} />
      <Button
        variant="primary"
        onClick={handleUpload}
        disabled={!file || loading || isDuplicate}
        className="w-[150px]"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader className="animate-spin" size={16} />
            Uploading...
          </div>
        ) : (
          'Upload File'
        )}
      </Button>
    </div>
  );
}
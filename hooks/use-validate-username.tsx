import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserByUsername } from '@/services/user-service';

export const useValidateUsername = () => {
  const [isValidUsername, setIsValidUsername] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const validateUsername = async () => {
      if (!pathname) return;

      const username = pathname.split('/')[1];

      if (!username) {
        setIsValidUsername(false);
        router.replace('/404');
        return;
      }

      try {
        const isValid = await getUserByUsername(username);
        setIsValidUsername(isValid);

        if (!isValid) {
          router.replace('/404');
        }
      } catch (error) {
        console.error('Error validating username:', error);
        setIsValidUsername(false);
        router.replace('/404');
      } finally {
        setIsLoading(false);
      }
    };

    validateUsername();
  }, [pathname, router]);

  return { isValidUsername, isLoadingValidation: isLoading };
};

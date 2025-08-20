// hooks/use-click-outside.ts

import { useEffect } from 'react';

interface UseClickOutsideProps {
  ref: React.RefObject<HTMLElement>;
  handler: (event: MouseEvent | TouchEvent | PointerEvent) => void;
  excludedRefs?: React.RefObject<HTMLElement>[];
  shouldIgnore?: boolean;
}

const useClickOutside = ({
  ref,
  handler,
  excludedRefs = [],
  shouldIgnore = false,
}: UseClickOutsideProps) => {
  useEffect(() => {
    if (shouldIgnore) return;

    const listener = (
      event: MouseEvent | TouchEvent | PointerEvent
    ) => {
      if (ref.current && ref.current.contains(event.target as Node)) {
        return;
      }

      for (const excludedRef of excludedRefs) {
        if (
          excludedRef.current &&
          excludedRef.current.contains(event.target as Node)
        ) {
          return;
        }
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener, true);
    document.addEventListener('touchstart', listener, true);
    document.addEventListener('pointerdown', listener, true);

    return () => {
      document.removeEventListener('mousedown', listener, true);
      document.removeEventListener('touchstart', listener, true);
      document.removeEventListener('pointerdown', listener, true);
    };
  }, [ref, handler, excludedRefs, shouldIgnore]);
};

export default useClickOutside;

// Hook taken from https://usehooks.com/useOnScreen/
import { useEffect, useState } from 'react';

const hasInteractionObserverSupport =
  typeof IntersectionObserver !== 'undefined';

export function useOnScreen(
  ref: React.RefObject<any>,
  rootMargin: string = '0px'
) {
  const [isIntersecting, setIntersecting] = useState(
    !hasInteractionObserverSupport // true if we don't have support
  );

  useEffect(() => {
    if (!hasInteractionObserverSupport) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },

      {
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(ref.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return isIntersecting;
}

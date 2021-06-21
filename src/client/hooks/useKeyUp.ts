import { useEffect, useRef } from 'react';

export function useKeyUp(handler: (event: KeyboardEvent) => void) {
  const savedHandler = useRef<(event: KeyboardEvent) => void>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: KeyboardEvent) =>
      savedHandler.current && savedHandler.current(event);

    window.addEventListener('keyup', eventListener);

    return () => {
      window.removeEventListener('keyup', eventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

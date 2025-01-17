import { useEffect, useRef } from 'react';

export function useKey(
  eventName: 'keyup' | 'keydown',
  handler: (event: KeyboardEvent) => void
) {
  const savedHandler = useRef<(event: KeyboardEvent) => void>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: KeyboardEvent) =>
      savedHandler.current && savedHandler.current(event);

    window.addEventListener(eventName, eventListener);

    return () => {
      window.removeEventListener(eventName, eventListener);
    };
  }, []);
}

export function useKeyUp(handler: (event: KeyboardEvent) => void) {
  useKey('keyup', handler);
}

export function useKeyDown(handler: (event: KeyboardEvent) => void) {
  useKey('keydown', handler);
}

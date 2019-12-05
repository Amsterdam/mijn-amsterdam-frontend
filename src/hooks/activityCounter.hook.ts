import { useEffect, useState } from 'react';
import { throttle } from 'throttle-debounce';

const defaultEvents = [
  'mousemove',
  'mousedown',
  'resize',
  'keydown',
  'touchstart',
  'wheel',
];

export default function useActivityCounter(throttleTimeoutMs: number = 30000) {
  const state = useState(0);
  const [, setCount] = state;

  const stillActive = throttle(throttleTimeoutMs, () =>
    setCount(count => count + 1)
  );

  useEffect(() => {
    defaultEvents.forEach(eventName => {
      window.addEventListener(eventName, stillActive);
    });
    return () => {
      defaultEvents.forEach(eventName => {
        window.removeEventListener(eventName, stillActive);
      });
    };
  }, [stillActive]);

  return state;
}

import { useState, useEffect } from 'react';
import { throttle } from 'throttle-debounce';

export default function useActivityCounter(throttleTimeoutMs: number = 3000) {
  const defaultEvents = [
    'mousemove',
    'mousedown',
    'resize',
    'keydown',
    'touchstart',
    'wheel',
  ];
  const state = useState(0);
  const [, setCount] = state;

  const stillActive = () => setCount(count => count + 1);

  useEffect(() => {
    defaultEvents.forEach(eventName => {
      window.addEventListener(eventName, stillActive);
    });
    return () => {
      defaultEvents.forEach(eventName => {
        window.removeEventListener(eventName, stillActive);
      });
    };
  }, []);

  return state;
}

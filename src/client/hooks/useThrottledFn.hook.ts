import { useEffect, useMemo, useRef } from 'react';
import { throttle } from 'throttle-debounce';

const defaultEvents = [
  'mousemove',
  'mousedown',
  'resize',
  'keydown',
  'touchstart',
  'wheel',
];

export function useActivityThrottle(
  callback: () => void,
  throttleTimeoutMs = 5000
) {
  const throttledCallback = useThrottledFn(callback, throttleTimeoutMs);

  useEffect(() => {
    defaultEvents.forEach(eventName => {
      window.addEventListener(eventName, throttledCallback);
    });
    return () => {
      defaultEvents.forEach(eventName => {
        window.removeEventListener(eventName, throttledCallback);
      });
    };
  }, [throttledCallback]);
}

export function useThrottledFn(fn: () => void, throttleTimeoutMs = 5000) {
  const callbackRef = useRef<any>(null);
  const throttledRef = useRef<any>(null);

  useEffect(() => {
    callbackRef.current = fn;
  }, [fn]);

  const throttledCallback = (throttledRef.current = useMemo(() => {
    return throttle(throttleTimeoutMs, () => {
      callbackRef.current && callbackRef.current();
    });
  }, [throttleTimeoutMs]));

  useEffect(() => {
    return () => {
      throttledRef.current && throttledRef.current.cancel();
    };
  }, []);

  return throttledCallback;
}

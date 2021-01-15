import { useEffect, useRef, useState } from 'react';

const ONE_SECOND_IN_MS = 1000;

export interface CounterProps {
  incrementWith: number;
  intervalMs: number;
  maxCount: number;
  onMaxCount: (maxCount: number) => void;
  onTick: (count: number) => void;
  startPaused: boolean;
  startCountAt: number;
}

const DefaultConfig: CounterProps = {
  incrementWith: 1,
  intervalMs: ONE_SECOND_IN_MS,
  maxCount: Infinity,
  onMaxCount: (maxCount: number) => void 0,
  onTick: (count: number) => void 0,
  startPaused: false,
  startCountAt: 0,
};

// taken from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useInterval(callback: any, delay: number = 1000) {
  const savedCallback: any = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay > 0) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function useCounter(nConfig: Partial<CounterProps> = DefaultConfig) {
  const config = { ...DefaultConfig, ...nConfig };
  const {
    incrementWith,
    intervalMs,
    maxCount,
    onMaxCount,
    startPaused,
    startCountAt,
    onTick,
  } = config;

  const [count, setCount] = useState(startCountAt);
  const [intervalMsCurrent, setIntervalMsCurrent] = useState(
    startPaused ? 0 : intervalMs
  );

  function pause() {
    setIntervalMsCurrent(0);
  }

  function reset() {
    setCount(0);
  }

  function resume() {
    setIntervalMsCurrent(intervalMs);
  }

  useInterval(() => {
    // this state is not yet available in the rest of this function body
    setCount((count) => count + incrementWith);
    if (typeof onTick === 'function') {
      onTick(count + incrementWith);
    }
    // Check if new count is max count
    if (count + incrementWith >= maxCount) {
      pause();
      if (typeof onMaxCount === 'function') {
        onMaxCount(count + incrementWith);
      }
    }
  }, intervalMsCurrent);

  return { count, pause, resume, reset };
}

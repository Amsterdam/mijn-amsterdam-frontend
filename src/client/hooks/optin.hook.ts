import { useCookie } from './storage.hook';
import { useCallback, useMemo } from 'react';

export interface OptIn {
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
}

export function useOptIn(): OptIn {
  const [isOptIn, setOptIn] = useCookie('optInPersonalizedTips', 'no');

  const optIn = useCallback(() => {
    setOptIn('yes', { path: '/' });
  }, [setOptIn]);

  const optOut = useCallback(() => {
    setOptIn('no', { path: '/' });
  }, [setOptIn]);

  return useMemo(() => {
    console.log('isOptin', isOptIn === 'yes');
    return { isOptIn: isOptIn === 'yes', optIn, optOut };
  }, [isOptIn, optIn, optOut]);
}

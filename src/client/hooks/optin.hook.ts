import { useCookie } from './storage.hook';
import { useCallback, useMemo } from 'react';

export interface Optin {
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
}

export function useOptIn(): Optin {
  const [isOptIn, setOptIn] = useCookie('optInPersonalizedTips', 'no');

  const optIn = useCallback(() => {
    setOptIn('yes', { path: '/' });
  }, [setOptIn]);

  const optOut = useCallback(() => {
    setOptIn('no', { path: '/' });
  }, [setOptIn]);

  return useMemo(() => ({ isOptIn: isOptIn === 'yes', optIn, optOut }), [
    isOptIn,
    optIn,
    optOut,
  ]);
}

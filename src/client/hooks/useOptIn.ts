import { useCallback, useMemo } from 'react';
import { useCookie, cookieAtom } from './useCookie';
import { useRecoilValue } from 'recoil';

export interface OptIn {
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
}

export function useOptIn(): OptIn {
  const [isOptInCookie, setOptInCookie] = useCookie(
    'optInPersonalizedTips',
    'no',
    { path: '/' }
  );

  const optIn = useCallback(() => {
    setOptInCookie('yes');
  }, [setOptInCookie]);

  const optOut = useCallback(() => {
    setOptInCookie('no');
  }, [setOptInCookie]);

  return useMemo(() => {
    return { isOptIn: isOptInCookie === 'yes', optIn, optOut };
  }, [isOptInCookie, optIn, optOut]);
}

export function useOptInValue() {
  return useRecoilValue(cookieAtom).optInPersonalizedTips === 'yes';
}

import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { cookieAtom, COOKIE_OPTIN, useCookie } from './useCookie';

export interface OptIn {
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
}

export function useOptIn(): OptIn {
  const profileType = useProfileTypeValue();
  const [isOptInCookie, setOptInCookie] = useCookie(COOKIE_OPTIN, {
    path: '/',
  });

  const isPersonalizedTipsEnabled = isUiElementVisible(
    profileType,
    'persoonlijkeTips'
  );

  const optIn = useCallback(() => {
    setOptInCookie('yes');
  }, [setOptInCookie]);

  const optOut = useCallback(() => {
    setOptInCookie('no');
  }, [setOptInCookie]);

  return useMemo(() => {
    return {
      isOptIn: isOptInCookie === 'yes',
      optIn,
      optOut,
    };
  }, [isOptInCookie, optIn, optOut]);
}

export function useOptInValue() {
  const profileType = useProfileTypeValue();
  const isPersonalizedTipsEnabled = isUiElementVisible(
    profileType,
    'persoonlijkeTips'
  );
  return (
    useRecoilValue(cookieAtom)[COOKIE_OPTIN] === 'yes' &&
    isPersonalizedTipsEnabled
  );
}

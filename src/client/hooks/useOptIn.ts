import { useCallback, useMemo } from 'react';
import { useCookie, cookieAtom, COOKIE_OPTIN } from './useCookie';
import { useRecoilValue } from 'recoil';
import { isUiElementVisible } from '../config/app';
import { useProfileTypeValue } from './useProfileType';

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
      isOptIn: isPersonalizedTipsEnabled && isOptInCookie === 'yes',
      optIn,
      optOut,
    };
  }, [isOptInCookie, optIn, optOut, isPersonalizedTipsEnabled]);
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

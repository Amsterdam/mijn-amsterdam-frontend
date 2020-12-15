import * as Cookies from 'js-cookie';
import { useCallback } from 'react';
import { atom, useRecoilState } from 'recoil';

export const COOKIE_OPTIN = 'optInPersonalizedTips';
export const COOKIE_OPTIN_DEFAULT_VALUE = 'no';

const defaultCookieState = {
  [COOKIE_OPTIN]: Cookies.get(COOKIE_OPTIN) || COOKIE_OPTIN_DEFAULT_VALUE,
};

export const cookieAtom = atom<Record<string, string>>({
  key: 'appCookies',
  default: defaultCookieState,
});

export function useCookie(
  name: string,
  options: Record<string, string>
): [string, (value: string) => void] {
  const [cookies, setCookie] = useRecoilState(cookieAtom);
  const setCookieAtomValue = useCallback(
    (value: string) => {
      Cookies.set(name, value, options);
      setCookie((cookies) => Object.assign({}, cookies, { [name]: value }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return [cookies[name], setCookieAtomValue];
}

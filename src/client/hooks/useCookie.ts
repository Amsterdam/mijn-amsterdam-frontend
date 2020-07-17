import { atom, useRecoilState } from 'recoil';
import { useEffect, useCallback } from 'react';
import * as Cookies from 'js-cookie';

const cookieAtom = atom<Record<string, string>>({
  key: 'appCookies',
  default: {},
});

export function useCookie(
  name: string,
  initialValue: string,
  options: Record<string, string>
): [string, (value: string) => void] {
  const [cookies, setCookie] = useRecoilState(cookieAtom);
  const valueInitial = Cookies.get(name) || initialValue;
  const setCookieAtomValue = useCallback(
    (value: string) => {
      Cookies.set(name, value, options);
      setCookie(cookies => Object.assign({}, cookies, { [name]: value }));
    },
    [setCookie]
  );

  useEffect(() => {
    setCookieAtomValue(valueInitial);
  }, [setCookieAtomValue]);

  return [cookies[name] || valueInitial, setCookieAtomValue];
}

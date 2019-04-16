import { format } from 'date-fns';
import NL_LOCALE from 'date-fns/locale/nl';
import { DEFAULT_DATE_FORMAT } from 'App.constants';

export function defaultDateFormat(datestr: string) {
  return format(datestr, DEFAULT_DATE_FORMAT, { locale: NL_LOCALE });
}

// https://github.com/Microsoft/TypeScript/issues/21826#issuecomment-479851685
export const entries = Object.entries as <T>(
  o: T
) => [Extract<keyof T, string>, T[keyof T]][];

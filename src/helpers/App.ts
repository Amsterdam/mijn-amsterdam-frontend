import { format } from 'date-fns';
import NL_LOCALE from 'date-fns/locale/nl';
import { DEFAULT_DATE_FORMAT } from 'App.constants';

export function defaultDateFormat(datestr: string) {
  return format(datestr, DEFAULT_DATE_FORMAT, { locale: NL_LOCALE });
}

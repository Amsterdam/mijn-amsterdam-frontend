import { format } from 'date-fns';
import { DEFAULT_DATE_FORMAT } from 'App.constants';

export function defaultDateFormat(datestr) {
  return format(datestr, DEFAULT_DATE_FORMAT);
}

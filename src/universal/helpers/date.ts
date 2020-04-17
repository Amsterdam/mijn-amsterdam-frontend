import { format, parseISO } from 'date-fns';

import { DEFAULT_DATE_FORMAT } from '../config';
import NL_LOCALE from 'date-fns/locale/nl';

export function dateFormat(datestr: string | Date | number, fmt: string) {
  if (!datestr) {
    return '';
  }
  const d = typeof datestr === 'string' ? parseISO(datestr) : datestr;
  return format(d, fmt, { locale: NL_LOCALE });
}

export function defaultDateFormat(datestr: string | Date | number) {
  return dateFormat(datestr, DEFAULT_DATE_FORMAT);
}

export function formattedTimeFromSeconds(seconds: number, format = 'mm:ss') {
  const secs = seconds % 60;
  const mins = (seconds - secs) / 60;

  const time = new Date(0, 0, 0, 0, mins, secs);
  const formattedTime = dateFormat(time, format);

  return formattedTime;
}

export function isDateInPast(date: string | Date, dateNow: string | Date) {
  return new Date(date).getTime() <= new Date(dateNow).getTime();
}

export function dateSort(sortKey: string, direction: 'asc' | 'desc' = 'asc') {
  return (a: any, b: any) => {
    const c = parseISO(a[sortKey]).getTime();
    const d = parseISO(b[sortKey]).getTime();

    const s = direction === 'asc' ? c < d : d < c;

    if (s) {
      return -1;
    } else if (c === d) {
      return 0;
    } else {
      return 1;
    }
  };
}

export function getMonth(index: number) {
  return [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december',
  ][index];
}

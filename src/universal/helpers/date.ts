import {
  differenceInDays,
  differenceInMonths,
  format,
  formatDistanceToNow,
  isThisYear,
  parseISO,
} from 'date-fns';
import NL_LOCALE from 'date-fns/locale/nl';
import { DEFAULT_DATE_FORMAT } from '../config';

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

export function defaultDateTimeFormat(datestr: string | Date | number) {
  return dateFormat(datestr, `dd MMMM 'om' HH.mm 'uur'`);
}

export function dateTimeFormatYear(datestr: string | Date | number) {
  return dateFormat(datestr, `dd MMMM yyyy 'om' HH.mm 'uur'`);
}

export function formatDurationInWords(datestr: string) {
  return formatDistanceToNow(new Date(datestr), { locale: NL_LOCALE });
}

export function calculateDaysBetweenDates(
  date1: string,
  date2: string
): number {
  return differenceInDays(new Date(date1), new Date(date2));
}

export function formattedTimeFromSeconds(seconds: number, format = 'mm:ss') {
  const secs = seconds % 60;
  const mins = (seconds - secs) / 60;

  const time = new Date(0, 0, 0, 0, mins, secs);
  const formattedTime = dateFormat(time, format);

  return formattedTime;
}
/**
 * Checks if date is a date is historic, today _is_ included.
 */
export function isDateInPast(
  date: string | Date,
  dateNow: string | Date = new Date()
) {
  return new Date(date).getTime() <= new Date(dateNow).getTime();
}

export function dateSort(sortKey: string, direction: 'asc' | 'desc' = 'asc') {
  return (a: any, b: any) => {
    const c = parseISO(a[sortKey]);
    const d = parseISO(b[sortKey]);

    // @ts-ignore
    return direction === 'asc' ? c - d : d - c;
  };
}

export function isCurrentYear(datestr: string) {
  return isThisYear(new Date(datestr));
}

export function monthsFromNow(datestr: string, dateNow?: Date) {
  return differenceInMonths(new Date(datestr), dateNow || new Date());
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

export function displayDateRange(dateStart: string, dateEnd: string) {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${getMonth(
        end.getMonth()
      )} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${getMonth(
      end.getMonth()
    )} - ${end.getDate()} ${getMonth(end.getMonth())} ${start.getFullYear()}`;
  }
  return `${defaultDateFormat(dateStart)} - ${defaultDateFormat(dateEnd)}`;
}

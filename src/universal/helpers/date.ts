import {
  differenceInDays,
  differenceInMonths,
  format,
  formatDistanceToNow,
  isThisYear,
  parseISO,
} from 'date-fns';
import { nl } from 'date-fns/locale/nl';

// See https://date-fns.org/v1.30.1/docs/format for more formatting options
const DEFAULT_DATE_FORMAT = 'dd MMMM yyyy';
const ISO_DATE_FORMAT = 'yyyy-MM-dd';

export function dateFormat(datestr: string | Date | number, fmt: string) {
  if (!datestr) {
    return '';
  }
  try {
    const d = typeof datestr === 'string' ? parseISO(datestr) : datestr;
    return format(d, fmt, { locale: nl });
  } catch (_error) {
    console.error(`Could not parse date ${datestr}`);
  }

  return String(datestr);
}

export function defaultDateFormat(datestr: string | Date | number) {
  return dateFormat(datestr, DEFAULT_DATE_FORMAT);
}

export function isoDateFormat(datestr: string | Date | number) {
  return dateFormat(datestr, ISO_DATE_FORMAT);
}

export function defaultDateTimeFormat(datestr: string | Date | number) {
  return dateFormat(datestr, `dd MMMM 'om' HH.mm 'uur'`);
}

export function dateTimeFormatYear(datestr: string | Date | number) {
  return dateFormat(datestr, `dd MMMM yyyy 'om' HH.mm 'uur'`);
}

export function formatDurationInWords(datestr: string) {
  return formatDistanceToNow(new Date(datestr), { locale: nl });
}

export function formatMonthAndYear(datestr: string | Date | number) {
  return dateFormat(datestr, 'MMMM yyyy');
}

export function formatYear(datestr: string | Date | number) {
  return dateFormat(datestr, 'yyyy');
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
 * Checks if date is a date is historic, dateNow _is_ included.
 */
export function isDateInPast(
  date: string,
  dateNow: string | Date = new Date()
) {
  if (typeof dateNow === 'string') {
    dateNow = parseISO(dateNow);
  }
  const date_ = parseISO(date);
  return date_.getTime() <= dateNow.getTime();
}
/**
 * Checks if date is a date in the future, dateNow _is_ included.
 */
export function isDateInFuture(
  date: string,
  dateNow: string | Date = new Date()
) {
  return !isDateInPast(date, dateNow);
}

export function dateSort<T extends object>(
  sortKey: keyof T,
  direction: 'asc' | 'desc' = 'asc'
) {
  function getDateCompareValue(value: unknown) {
    if (value instanceof Date) {
      return value.getTime();
    }
    if (typeof value === 'string') {
      return parseISO(value).getTime();
    }
    return null;
  }

  return (a: T, b: T) => {
    const c = getDateCompareValue(a[sortKey]);
    const d = getDateCompareValue(b[sortKey]);

    if (c === null || d === null) {
      return 0;
    }

    return direction === 'asc' ? c - d : d - c;
  };
}

export function isCurrentYear(datestr: string) {
  return isThisYear(new Date(datestr));
}

export function monthsFromNow(datestr: string, dateNow?: Date) {
  return differenceInMonths(parseISO(datestr), dateNow || new Date());
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
  const start = parseISO(dateStart);
  const end = parseISO(dateEnd);

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

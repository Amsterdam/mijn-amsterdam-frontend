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

export function dateFormat(datestr: string | Date | number, fmt: string) {
  if (!datestr) {
    return '';
  }
  try {
    const d = typeof datestr === 'string' ? parseISO(datestr) : datestr;
    return format(d, fmt, { locale: nl });
  } catch (error) {
    console.error(`Could not parse date ${datestr}`);
  }

  return String(datestr);
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
 * Checks if date is a date is historic, today _is_ included.
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

export function dateSort(sortKey: string, direction: 'asc' | 'desc' = 'asc') {
  return (a: any, b: any) => {
    const v1 = a[sortKey];
    const v2 = b[sortKey];
    const c =
      v1 instanceof Date ? v1 : typeof v1 === 'string' ? parseISO(v1) : null;
    const d =
      v2 instanceof Date ? v2 : typeof v2 === 'string' ? parseISO(v2) : null;
    if (!c || !d) {
      return 0;
    }
    // @ts-ignore
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

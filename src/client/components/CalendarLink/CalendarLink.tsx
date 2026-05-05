import type { ReactNode } from 'react';

import { captureException } from '../../helpers/monitoring.ts';
import { MaLink } from '../MaLink/MaLink.tsx';

type ICSData = {
  start: Date;
  end: Date;
  uid: string;
  summary: string;
  description: string;
  // Free form location field. Example: Amsterdam City Hall, Amstel 1, 1011 PN Amsterdam, Netherlands, Room 101
  location: string;
};

type CalendarLinkProps = {
  children?: ReactNode;
  className?: string;
  icsData: ICSData;
};

function pad(date: string) {
  return date.padStart(2, '0');
}

/**
 * Formats to an ICAL date string in YYYYMMDDTHHMMSSZ format.
 */
function toICALDateTimeString(date: Date): string {
  const year = date.getUTCFullYear().toString();
  const month = pad((date.getUTCMonth() + 1).toString());
  const day = pad(date.getUTCDate().toString());

  const hours = pad(date.getUTCHours().toString());
  const minutes = pad(date.getUTCMinutes().toString());
  const seconds = pad(date.getUTCSeconds().toString());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function createICS({
  uid,
  start,
  end,
  summary,
  description,
  location,
}: ICSData): string {
  const icalContent = [
    `BEGIN:VCALENDAR`,
    `VERSION:2.0`,
    `PRODID:-//Amsterdam//NONSGML v1.0//EN`,
    `BEGIN:VEVENT`,
    `UID:${uid}`,
    `DTSTAMP:${toICALDateTimeString(new Date())}`,
    `DTSTART:${toICALDateTimeString(start)}`,
    `DTEND:${toICALDateTimeString(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `END:VEVENT`,
    `END:VCALENDAR`,
  ]
    .map(foldLine)
    .join('\r\n');
  return icalContent;
}

/**
 * Fold a line according to RFC 5545 (ICS file spec).
 * Ensures lines are no longer than 75 bytes, folding with CRLF + space.
 */
function foldLine(line: string): string {
  if (line.length > 100_000) {
    captureException(new Error('Line too long'));
    return '';
  }
  const maxBytes = 75;
  const encoder = new TextEncoder();
  let foldedLine = '';
  let currentLine = '';

  for (const char of line) {
    const charBytes = encoder.encode(char);
    const currentBytes = encoder.encode(currentLine).length;

    if (currentBytes + charBytes.length > maxBytes) {
      foldedLine += currentLine + '\r\n ';
      currentLine = char;
    } else {
      currentLine += char;
    }
  }

  foldedLine += currentLine;

  return foldedLine;
}

/**
 * Create a CalendarLink with an ICS (RFC 5545) file download on clicking it.
 *
 * The uid in icsData should be unique,
 * also think about what other items might be present in the users calendar.
 */
export function CalendarLink({
  children,
  className,
  icsData,
}: CalendarLinkProps) {
  function handleDownload(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const icalContent = createICS(icsData);

    const blob = new Blob([icalContent], {
      type: 'text/calendar;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${icsData.uid}.ics`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <MaLink className={className} href="#" onClick={handleDownload}>
      {children}
    </MaLink>
  );
}

export const forTesting = { createICS };

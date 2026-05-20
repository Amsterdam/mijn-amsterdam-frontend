import { parseISO } from 'date-fns';

import { captureException } from '../services/monitoring.ts';

type ICSData = {
  start: string;
  end: string;
  uid: string;
  summary: string;
  description: string;
  // Free form location field. Example: Amsterdam City Hall, Amstel 1, 1011 PN Amsterdam, Netherlands, Room 101
  location: string;
};

function pad(date: string) {
  return date.padStart(2, '0');
}

/**
 * Escape text values according to RFC 5545.
 */
function escapeICSValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/**
 * Formats to an ICAL date string in YYYYMMDDTHHMMSSZ format.
 */
function toICALDateTimeString(date: string | Date): string {
  const date_ = typeof date === 'string' ? parseISO(date) : date;

  const year = date_.getUTCFullYear().toString();
  const month = pad((date_.getUTCMonth() + 1).toString());
  const day = pad(date_.getUTCDate().toString());

  const hours = pad(date_.getUTCHours().toString());
  const minutes = pad(date_.getUTCMinutes().toString());
  const seconds = pad(date_.getUTCSeconds().toString());

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
  const now = new Date();
  const icsContent = [
    `BEGIN:VCALENDAR`,
    `VERSION:2.0`,
    `PRODID:-//Amsterdam//NONSGML v1.0//EN`,
    `BEGIN:VEVENT`,
    `UID:${uid}`,
    `DTSTAMP:${toICALDateTimeString(now)}`,
    `DTSTART:${toICALDateTimeString(start)}`,
    `DTEND:${toICALDateTimeString(end)}`,
    `SUMMARY:${escapeICSValue(summary)}`,
    `DESCRIPTION:${escapeICSValue(description)}`,
    `LOCATION:${escapeICSValue(location)}`,
    `END:VEVENT`,
    `END:VCALENDAR`,
  ]
    .map(foldLine)
    .join('\r\n');
  return icsContent;
}

/**
 * Fold a line according to RFC 5545 (ICS file spec).
 * Ensures lines are no longer than 75 bytes, folding with CRLF + space.
 */
function foldLine(line: string): string {
  if (line.length > 100000) {
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

function icsDataUri(ics: string, useBase64 = true) {
  if (useBase64) {
    // btoa only works with ASCII; encodeURIComponent for utf-8-safe base64
    const base64 = btoa(encodeURIComponent(ics));
    return `data:text/calendar;charset=utf-8;base64,${base64}`;
  }
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export function createICSDataUri(icsData: ICSData, useBase64 = true) {
  const icsContent = createICS(icsData);
  return icsDataUri(icsContent, useBase64);
}

export const forTesting = {
  createICS,
  foldLine,
};

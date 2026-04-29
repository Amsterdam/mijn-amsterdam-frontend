import { ReactNode } from 'react';

type CalendarLinkProps = {
  children?: ReactNode;
  className?: string;
  // Format: use toICALDateTimeString(): YYYYMMDDTHHMMSSZ
  start: Date;
  end: Date;
  uid: string;
  summary: string;
  description: string;
  // Free form location field. Example: Amsterdam City Hall, Amstel 1, 1011 PN Amsterdam, Netherlands, Room 101
  location: string;
};

function leftPadWithZero(num: string): string {
  return num.length === 1 ? `0${num}` : num;
}

function toICALDateTimeString(date: Date): string {
  const year = date.getUTCFullYear().toString();
  const month = leftPadWithZero(date.getUTCMonth().toString());
  const day = leftPadWithZero(date.getUTCDate().toString());

  const hours = leftPadWithZero(date.getUTCHours().toString());
  const minutes = leftPadWithZero(date.getUTCMinutes().toString());
  const seconds = leftPadWithZero(date.getUTCSeconds().toString());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function CalendarLink({
  children,
  className,
  start,
  end,
  uid,
  summary,
  description,
  location,
}: CalendarLinkProps) {
  function handleDownload(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amsterdam//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${toICALDateTimeString(new Date())}
DTSTART:${toICALDateTimeString(start)}
DTEND:${toICALDateTimeString(end)}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icalContent], {
      type: 'text/calendar;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'event.ics';
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className={className}>
      <a href="#" onClick={handleDownload}>
        {children}
      </a>
    </div>
  );
}

import { render } from '@testing-library/react';
import mockdate from 'mockdate';

import { CalendarLink, forTesting } from './CalendarLink.tsx';

const icsData = {
  start: new Date('2025-01-01T00:00:00Z'),
  end: new Date('2025-01-01T00:30:00Z'),
  uid: 'unique-id-123',
  summary: 'Summary',
  description: 'Description',
  location: 'Location',
};

test('Renders', async () => {
  const text = 'Calendar Link Text';
  const screen = render(<CalendarLink icsData={icsData}>{text}</CalendarLink>);
  expect(screen.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <a
        class="ams-link _MaLink_10c0a4"
        href="#"
      >
        Calendar Link Text
      </a>
    </DocumentFragment>
  `);
});

test('formats ics correctly', () => {
  const now = '2025-01-01T00:00:00Z';
  mockdate.set(new Date(now));
  const result = forTesting.createICS(icsData);
  expect(result).toBe(`BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Amsterdam//NONSGML v1.0//EN\r
BEGIN:VEVENT\r
UID:unique-id-123\r
DTSTAMP:20250101T000000Z\r
DTSTART:20250101T000000Z\r
DTEND:20250101T003000Z\r
SUMMARY:Summary\r
DESCRIPTION:Description\r
LOCATION:Location\r
END:VEVENT\r
END:VCALENDAR`);
});

test('Lines cannot be longer then 75 bytes (octets)', () => {
  const icsData = {
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2025-01-01T00:30:00Z'),
    uid: 'unique-id-123',
    // In steps of 10: (.........-)
    summary:
      '.........-.........-.........-.........-.........-.........-.........-.........-.........-.........-.........-.........-.........-.........-.........-.........-.........-',
    // SIZE = 'DESCRIPTION:' + 'Array(...)' = 12 + 16 * 4 = 76 bytes, which is one too much.
    description: new Array(16).fill('🚲').join(''),
    location: 'Location',
  };

  const now = '2025-01-01T00:00:00Z';
  mockdate.set(new Date(now));
  const result = forTesting.createICS(icsData);
  expect(result).toBe(`BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Amsterdam//NONSGML v1.0//EN\r
BEGIN:VEVENT\r
UID:unique-id-123\r
DTSTAMP:20250101T000000Z\r
DTSTART:20250101T000000Z\r
DTEND:20250101T003000Z\r
SUMMARY:.........-.........-.........-.........-.........-.........-.......\r
 ..-.........-.........-.........-.........-.........-.........-.........-..\r
 .......-.........-.........-\r
DESCRIPTION:🚲🚲🚲🚲🚲🚲🚲🚲🚲🚲🚲🚲🚲🚲🚲\r
 🚲\r
LOCATION:Location\r
END:VEVENT\r
END:VCALENDAR`);
});

test('Can handle a line of 100_000 chars', () => {
  const icsData = {
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2025-01-01T00:30:00Z'),
    uid: 'unique-id-123',
    summary: 'Summary',
    description: new Array(100_000).fill('x').join(''),
    location: 'Location',
  };
  const now = '2025-01-01T00:00:00Z';
  mockdate.set(new Date(now));
  forTesting.createICS(icsData);
});

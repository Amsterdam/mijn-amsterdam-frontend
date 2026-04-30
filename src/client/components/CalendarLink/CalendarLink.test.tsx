import { CalendarLink, forTesting } from './CalendarLink.tsx';
import { render } from '@testing-library/react';
import mockdate from 'mockdate';

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
  expect(result).toBe(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amsterdam//NONSGML v1.0//EN
BEGIN:VEVENT
UID:unique-id-123
DTSTAMP:20250001T000000Z
DTSTART:20250001T000000Z
DTEND:20250001T003000Z
SUMMARY:Summary
DESCRIPTION:Description
LOCATION:Location
END:VEVENT
END:VCALENDAR`);
});

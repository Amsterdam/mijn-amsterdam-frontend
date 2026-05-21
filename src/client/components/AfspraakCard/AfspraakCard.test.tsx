import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import mockdate from 'mockdate';
import { BrowserRouter } from 'react-router';

import { AfspraakCard } from './AfspraakCard.tsx';
import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';

const mocks = vi.hoisted(() => {
  return {
    isSmallScreen: false,
  };
});

vi.mock('../../hooks/media.hook.ts', async (importOriginal) => ({
  ...(await importOriginal()),
  useSmallScreen: () => mocks.isSmallScreen,
}));

const afspraak: AfspraakFrontend = {
  subject: 'Varen',
  dateStart: '2020-01-17T17:50:00Z',
  dateEnd: '2020-01-17T18:20:00Z',
  dateStartFormatted: 'maandag 01 januari 2025',
  dateEndFormatted: 'maandag 01 januari 2025',
  status: 'New',
  qrCode: 'qrcode-123',
  caseReference: 'unique-123',
  cancellationLink: 'https://cancel.com',
  displayDateTime: 'maandag 01 januari 2025 van 17:50 tot 18:20',
  location: {
    name: 'Centrum',
    street: 'Amstel 1',
    postalCode: '1020 HA',
    city: 'Amsterdam',
    countryCode: 'NL',
  },
  link: {
    to: '/qr/123',
    title: 'Bekijk afspraak',
  },
  icsLink: {
    to: 'data:text/calendar;base64,abc123',
    title: 'Voeg toe aan agenda',
    download: `afspraak-unique-123.ics`,
  },
};

function renderAfspraakCard(afspraak: AfspraakFrontend) {
  return render(<AfspraakCard afspraak={afspraak}></AfspraakCard>, {
    wrapper: BrowserRouter,
  });
}

describe('Renders afspraak data', () => {
  beforeEach(() => {
    mocks.isSmallScreen = false;
    mockdate.set('2020-01-01');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Large screen', () => {
    const screen = renderAfspraakCard(afspraak);
    expect(screen.asFragment()).toMatchSnapshot();
  });

  test('Small screen', () => {
    mocks.isSmallScreen = true;
    const screen = renderAfspraakCard(afspraak);
    expect(screen.asFragment()).toMatchSnapshot();
  });

  test('Opens QR code modal', async () => {
    const screen = renderAfspraakCard(afspraak);
    const user = userEvent.setup();
    const button = screen.getByRole('button', {
      name: /Toon QR code/i,
    });
    await user.click(button);
    screen.getByText(/QR code - Stadsloket Centrum/i);
  });
});

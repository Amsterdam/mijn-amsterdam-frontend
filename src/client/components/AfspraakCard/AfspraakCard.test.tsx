import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import mockdate from 'mockdate';
import nock from 'nock';
import { BrowserRouter } from 'react-router';

import { AfspraakCard } from './AfspraakCard.tsx';
import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';

const address = { street: 'Amstel', houseNumber: 1 };

const afspraak: AfspraakFrontend = {
  subject: 'Varen',
  products: [
    {
      name: 'Varen',
    },
  ],
  heading: 'Varen Afspraak',
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
    street: address.street + ' ' + address.houseNumber,
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

function renderAfspraakCard(
  afspraak: AfspraakFrontend,
  compact: boolean = false
) {
  return render(
    <AfspraakCard afspraak={afspraak} compact={compact}></AfspraakCard>,
    {
      wrapper: BrowserRouter,
    }
  );
}

function setupNockForLocationModal() {
  nock('https://api.data.amsterdam.nl')
    .get('/v1/benkagg/adresseerbareobjecten/')
    .query({
      openbareruimteNaam: address.street,
      huisnummer: address.houseNumber,
    })
    .reply(200, {});
}

describe('Renders afspraak data', () => {
  beforeEach(() => {
    mockdate.set('2020-01-01');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    nock.cleanAll();
  });

  test('Regular variant', () => {
    const screen = renderAfspraakCard(afspraak);
    expect(screen.asFragment()).toMatchSnapshot();
  });

  test('Compact variant', () => {
    const screen = renderAfspraakCard(afspraak, true);
    expect(screen.asFragment()).toMatchSnapshot();
  });

  it('Displays the heading', () => {
    const screen = renderAfspraakCard(afspraak);

    expect(
      screen.getByRole('heading', { name: afspraak.heading })
    ).toBeInTheDocument();
  });

  test('Opens QR code modal', async () => {
    const screen = renderAfspraakCard(afspraak);
    const user = userEvent.setup();
    const button = screen.getByRole('button', {
      name: /Toon QR code/i,
    });

    await user.click(button);
    expect(
      screen.getByText(/QR code - Stadsloket Centrum/i)
    ).toBeInTheDocument();
  });

  it('Opens location modal', async () => {
    setupNockForLocationModal();
    const screen = renderAfspraakCard(afspraak);
    const user = userEvent.setup();
    const button = screen.getByRole('button', {
      name: /Stadsloket Centrum, Amstel 1/i,
    });
    await user.click(button);
    expect(
      screen.getByText(/Stadsloket Centrum - Amstel 1/i)
    ).toBeInTheDocument();
  });

  it('Does not render location modal, if there is no street in afspraak', async () => {
    const afspraakWithoutStreet: AfspraakFrontend = {
      ...afspraak,
      location: {
        ...afspraak.location,
        street: null,
      },
    };
    const screen = renderAfspraakCard(afspraakWithoutStreet);
    const button = screen.queryByRole('button', {
      name: /Stadsloket Centrum, Amstel 1/i,
    });
    expect(button).not.toBeInTheDocument();
  });
});

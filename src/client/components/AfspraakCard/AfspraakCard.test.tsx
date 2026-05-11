import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router';

import { AfspraakCard } from './AfspraakCard.tsx';
import type { AfspraakFrontendFinal } from '../../pages/Thema/KlantContact/useKlantcontactData.hook.tsx';
import mockdate from 'mockdate';

const mocks = vi.hoisted(() => {
  return {
    isSmallScreen: false,
  };
});

vi.mock('../../hooks/media.hook.ts', async (importOriginal) => ({
  ...(await importOriginal()),
  useSmallScreen: () => mocks.isSmallScreen,
}));

mockdate.set('2020-01-01');

const afspraak: AfspraakFrontendFinal = {
  subject: 'Varen',
  startDate: new Date('2020-01-01T12:00:00Z'),
  endDate: new Date('2020-01-01T13:00:00Z'),
  status: 'New',
  qrCode: 'qrcode-123',
  caseReference: 'unique-123',
  dateFormatted: '01 Januari 2025',
  cancellationLink: 'https://cancel.com',
  displayDate: 'Datum, 01-01-2020 17:50',
  location: {
    name: 'Centrum',
    street: 'Amstel 1',
    postalCode: '1020 HA',
    city: 'Amsterdam',
    countryCode: 'NL',
  },
  qrCodeHref: '/qr/123',
};

function renderAfspraakCard(afspraak: AfspraakFrontendFinal) {
  return render(<AfspraakCard afspraak={afspraak}></AfspraakCard>, {
    wrapper: BrowserRouter,
  });
}

describe('Renders afspraak data', () => {
  beforeEach(() => {
    mocks.isSmallScreen = false;
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

  test('Can navigate to QR code page', async () => {
    const QR_PAGE_ID = 'QR Page';
    const screen = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<AfspraakCard afspraak={afspraak} />} />
          <Route path="/qr/:id" element={<div>{QR_PAGE_ID}</div>} />
        </Routes>
      </MemoryRouter>
    );
    const user = userEvent.setup();
    const link = screen.getByRole('button', {
      name: /Toon QR/i,
    }).parentNode;
    await user.click(link as HTMLElement);
    screen.getByText(QR_PAGE_ID);
  });
});

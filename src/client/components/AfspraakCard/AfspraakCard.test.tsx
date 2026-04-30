import { render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router';

import { AfspraakCard } from './AfspraakCard.tsx';
import type { AfspraakFrontendFinal } from '../../pages/Thema/KlantContact/useAfsprakenListData.hook.tsx';
import { userEvent } from '@testing-library/user-event';

const mocks = vi.hoisted(() => {
  return {
    isSmallScreen: false,
  };
});

vi.mock('../../hooks/media.hook.ts', async (importOriginal) => ({
  ...(await importOriginal()),
  useSmallScreen: () => mocks.isSmallScreen,
}));

const afspraak = {
  subject: 'Varen',
  cancellationLink: 'https://cancel.com',
  displayDate: 'Datum, 01-01-2020 17:50',
  location: {
    name: 'Centrum',
    street: 'Amstel 1',
    postalCode: '1020 HA',
    city: 'Amsterdam',
  },
  qrCodeHref: '/qr/123',
} as AfspraakFrontendFinal;

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

  test('Can click QR code', async () => {
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

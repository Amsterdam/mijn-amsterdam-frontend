import { render } from '@testing-library/react';

import { AfspraakCard } from './AfspraakCard.tsx';
import type { AfspraakFrontendFinal } from '../../pages/Thema/KlantContact/useAfsprakenListData.hook.tsx';
import { BrowserRouter } from 'react-router';

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
  qrCodeHref: 'https://qrcode.com/qr/123',
} as AfspraakFrontendFinal;

test('Renders afspraak data', () => {
  const screen = render(<AfspraakCard afspraak={afspraak}></AfspraakCard>, {
    wrapper: BrowserRouter,
  });
  expect(screen.asFragment()).toMatchSnapshot();
});

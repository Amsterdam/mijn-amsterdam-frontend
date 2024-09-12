import { render, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { AfisFacturen } from './AfisFacturen';
import { bffApi } from '../../../test-utils';
import { AfisFactuur } from '../../../server/services/afis/afis-types';

const businessPartnerIdEncrypted = 'yyy-456-yyy';
const testState = {
  AFIS: {
    status: 'OK',
    content: {
      isKnown: true,
      businessPartnerIdEncrypted,
    },
  },
} as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<AfisFacturen />', () => {
  const mockFacturen: AfisFactuur[] = [
    {
      id: 'F004',
      title: 'Invoice F004',
      afzender: 'Company D',
      datePublished: '2023-04-01',
      datePublishedFormatted: '1 april 2023',
      paymentDueDate: '2023-05-01',
      paymentDueDateFormatted: '1 mei 2023',
      debtClearingDate: null,
      debtClearingDateFormatted: null,
      amountOwed: 1500,
      amountOwedFormatted: '€ 1.500,00',
      factuurNummer: 'F004',
      status: 'openstaand',
      paylink: 'https://payment.example.com/F004',
      documentDownloadLink: 'https://download.example.com/F004',
    },
    {
      id: 'F005',
      title: 'Invoice F005',
      afzender: 'Company E',
      datePublished: '2023-04-15',
      datePublishedFormatted: '15 april 2023',
      paymentDueDate: '2023-05-15',
      paymentDueDateFormatted: '15 mei 2023',
      debtClearingDate: null,
      debtClearingDateFormatted: null,
      amountOwed: 2500,
      amountOwedFormatted: '€ 2.500,00',
      factuurNummer: 'F005',
      status: 'openstaand',
      paylink: 'https://payment.example.com/F005',
      documentDownloadLink: 'https://download.example.com/F005',
    },
  ];

  bffApi
    .get(`/services/afis/facturen/open/${businessPartnerIdEncrypted}`)
    .reply(200, {
      content: mockFacturen,
      status: 'OK',
    });

  const routeEntry = generatePath(AppRoutes['AFIS/FACTUREN'], { kind: 'open' });
  const routePath = AppRoutes['AFIS/FACTUREN'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={AfisFacturen}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', async () => {
    const screen = render(<Component />);
    expect(screen.asFragment()).toMatchSnapshot();

    await waitFor(() => {
      expect(screen.getByText('Company D')).toBeInTheDocument();
      expect(screen.getByText('Company E')).toBeInTheDocument();
    });
  });
});

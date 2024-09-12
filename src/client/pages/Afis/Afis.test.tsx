import { render, waitFor } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { AfisThemaPagina } from './Afis';
import { bffApi } from '../../../test-utils';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisFactuur,
} from '../../../server/services/afis/afis-types';

const businessPartnerIdEncrypted = 'xxx-123-xxx';
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

describe('<Afis />', () => {
  const businessPartnerDetails: AfisBusinessPartnerDetailsTransformed = {
    addressId: 999,
    businessPartnerId: 515177,
    fullName: 'Taxon Expeditions BV',
    phone: null,
    email: null,
  };

  const mockFacturen = {
    open: [
      {
        id: 'F001',
        title: 'Invoice F001',
        afzender: 'Company A',
        datePublished: '2023-01-15',
        datePublishedFormatted: '15 januari 2023',
        paymentDueDate: '2023-02-15',
        paymentDueDateFormatted: '15 februari 2023',
        debtClearingDate: null,
        debtClearingDateFormatted: null,
        amountOwed: 1000,
        amountOwedFormatted: '€ 1.000,00',
        factuurNummer: 'F001',
        status: 'openstaand',
        paylink: 'https://payment.example.com/F001',
        documentDownloadLink: 'https://download.example.com/F001',
      },
      {
        id: 'F003',
        title: 'Invoice F003',
        afzender: 'Company C',
        datePublished: '2023-03-10',
        datePublishedFormatted: '10 maart 2023',
        paymentDueDate: '2023-04-10',
        paymentDueDateFormatted: '10 april 2023',
        debtClearingDate: null,
        debtClearingDateFormatted: null,
        amountOwed: 2000,
        amountOwedFormatted: '€ 2.000,00',
        factuurNummer: 'F003',
        status: 'openstaand',
        paylink: 'https://payment.example.com/F003',
        documentDownloadLink: 'https://download.example.com/F003',
      },
    ],
    closed: [
      {
        id: 'F002',
        title: 'Invoice F002',
        afzender: 'Company B',
        datePublished: '2023-02-01',
        datePublishedFormatted: '1 februari 2023',
        paymentDueDate: '2023-03-01',
        paymentDueDateFormatted: '1 maart 2023',
        debtClearingDate: '2023-02-15',
        debtClearingDateFormatted: '15 februari 2023',
        amountOwed: 0,
        amountOwedFormatted: '€ 0,00',
        factuurNummer: 'F002',
        status: 'betaald',
        paylink: null,
        documentDownloadLink: 'https://download.example.com/F002',
      },
    ],
  };

  bffApi
    .get(`/services/afis/businesspartner/${businessPartnerIdEncrypted}`)
    .reply(200, {
      content: businessPartnerDetails,
      status: 'OK',
    });
  bffApi
    .get(`/services/afis/facturen/overzicht/${businessPartnerIdEncrypted}`)
    .reply(200, {
      content: mockFacturen,
      status: 'OK',
    });

  const routeEntry = generatePath(AppRoutes.AFIS);
  const routePath = AppRoutes.AFIS;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={AfisThemaPagina}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', async () => {
    const screen = render(<Component />);
    expect(screen.asFragment()).toMatchSnapshot();

    await waitFor(() => {
      expect(screen.getByText('Company B')).toBeInTheDocument();
    });
  });
});

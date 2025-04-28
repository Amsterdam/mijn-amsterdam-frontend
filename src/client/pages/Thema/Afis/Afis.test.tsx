import { render, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import {
  AfisBusinessPartnerDetailsTransformed,
  AfisFacturenByStateResponse,
} from '../../../../server/services/afis/afis-types';
import { bffApi } from '../../../../testing/utils';
import { AppRoutes } from '../../../../universal/config/routes';
import { AppState } from '../../../../universal/types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';
import { AfisThemaPagina } from './Afis';

const businessPartnerIdEncrypted = 'xxx-123-xxx';

const mockFacturen: AfisFacturenByStateResponse = {
  open: {
    count: 2,
    facturen: [
      {
        id: '1',
        afzender: 'Company A',
        datePublished: '2023-01-15',
        datePublishedFormatted: '15 januari 2023',
        paymentDueDate: '2023-02-15',
        paymentDueDateFormatted: '15 februari 2023',
        debtClearingDate: null,
        debtClearingDateFormatted: null,
        amountOriginal: '1000.00',
        amountOriginalFormatted: '€ 1.000,00',
        factuurNummer: 'F001',
        status: 'openstaand',
        statusDescription: 'openstaand',
        paylink: 'https://payment.example.com/F001',
        documentDownloadLink: 'https://download.example.com/F001',
        factuurDocumentId: '1',
        link: {
          to: AppRoutes.AFIS,
          title: 'Bekijk uw openstaande facturen',
        },
      },
      {
        id: '2',
        afzender: 'Company C',
        datePublished: '2023-03-10',
        datePublishedFormatted: '10 maart 2023',
        paymentDueDate: '2023-04-10',
        paymentDueDateFormatted: '10 april 2023',
        debtClearingDate: null,
        debtClearingDateFormatted: null,
        amountOriginal: '2000.00',
        amountOriginalFormatted: '€ 2.000,00',
        factuurNummer: 'F003',
        status: 'openstaand',
        statusDescription: 'openstaand',
        paylink: 'https://payment.example.com/F003',
        documentDownloadLink: 'https://download.example.com/F003',
        factuurDocumentId: '2',
        link: {
          to: AppRoutes.AFIS,
          title: 'Bekijk uw openstaande facturen',
        },
      },
    ],
  },
  afgehandeld: {
    count: 1,
    facturen: [
      {
        id: '3',
        afzender: 'Company B',
        datePublished: '2023-02-01',
        datePublishedFormatted: '1 februari 2023',
        paymentDueDate: '2023-03-01',
        paymentDueDateFormatted: '1 maart 2023',
        debtClearingDate: '2023-02-15',
        debtClearingDateFormatted: '15 februari 2023',
        amountOriginal: '0',
        amountOriginalFormatted: '€ 0,00',
        factuurNummer: 'F002',
        status: 'betaald',
        statusDescription: 'betaald',
        paylink: null,
        documentDownloadLink: 'https://download.example.com/F002',
        factuurDocumentId: '3',
        link: {
          to: AppRoutes.AFIS,
          title: 'Bekijk uw afgehandelde facturen',
        },
      },
    ],
  },
  overgedragen: { count: 0, facturen: [] },
};

const testState = {
  AFIS: {
    status: 'OK',
    content: {
      isKnown: true,
      businessPartnerIdEncrypted,
      facturen: mockFacturen,
    },
  },
} as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Afis />', () => {
  const businessPartnerDetails: AfisBusinessPartnerDetailsTransformed = {
    businessPartnerId: '000515177',
    fullName: 'Taxon Expeditions BV',
    phone: null,
    email: null,
  };

  bffApi
    .get(`/services/afis/businesspartner?id=${businessPartnerIdEncrypted}`)
    .reply(200, {
      content: businessPartnerDetails,
      status: 'OK',
    });

  const routeEntry = generatePath(AppRoutes.AFIS);
  const routePath = AppRoutes.AFIS;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={AfisThemaPagina}
        initializeState={initializeState}
      />
    );
  }

  it('Matches the Full Page snapshot', async () => {
    const screen = render(<Component />);
    expect(screen.asFragment()).toMatchSnapshot();

    await waitFor(() => {
      expect(screen.getByText('Company B')).toBeInTheDocument();
    });
  });
});

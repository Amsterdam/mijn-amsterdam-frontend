import { render, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router';

import { themaConfig } from './Afis-thema-config.ts';
import { AfisThema } from './AfisThema.tsx';
import type {
  AfisBusinessPartnerDetailsTransformed,
  AfisFacturenOverviewResponse,
} from '../../../../server/services/afis/afis-types.ts';
import { bffApi } from '../../../../testing/utils.ts';
import type { AppState } from '../../../../universal/types/App.types.ts';
import MockApp from '../../MockApp.tsx';

const businessPartnerIdEncrypted = 'xxx-123-xxx';

const mockFacturen: AfisFacturenOverviewResponse = {
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
          to: '/facturen-en-betalen/factuur/open/F001',
          title: 'Bekijk uw openstaande facturen',
        },
        amountPayed: '',
        amountPayedFormatted: '',
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
          to: '/facturen-en-betalen/factuur/open/F003',
          title: 'Bekijk uw openstaande facturen',
        },
        amountPayed: '',
        amountPayedFormatted: '',
      },
    ],
    state: 'open',
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
          to: '/facturen-en-betalen/factuur/afgehandeld/F002',
          title: 'Bekijk uw afgehandelde facturen',
        },
        amountPayed: '',
        amountPayedFormatted: '',
      },
    ],
    state: 'open',
  },
  overgedragen: {
    count: 0,
    facturen: [],
    state: 'open',
  },
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
  BELASTINGEN: {
    status: 'OK',
    content: {
      isKnown: true,
      url: 'https://belastingbalie.amsterdam.nl',
    },
  },
} as AppState;

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

  const routeEntry = generatePath(themaConfig.route.path);
  const routePath = themaConfig.route.path;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={AfisThema}
        state={testState}
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

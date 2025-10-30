import { render, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router';

import { routeConfig } from './Afis-thema-config';
import { AfisList } from './AfisList';
import { bffApi } from '../../../../testing/utils';
import { AppState } from '../../../../universal/types/App.types';
import MockApp from '../../MockApp';

const businessPartnerIdEncrypted = 'yyy-456-yyy';
const testState = {
  AFIS: {
    status: 'OK',
    content: {
      isKnown: true,
      businessPartnerId: '1234567890',
      businessPartnerIdEncrypted,
      facturen: {
        open: {
          count: 1,
          facturen: [
            {
              id: '2',
              factuurDocumentId: '2',
              afzender: 'Company E',
              datePublished: '2023-04-15',
              datePublishedFormatted: '15 april 2023',
              paymentDueDate: '2023-05-15',
              paymentDueDateFormatted: '15 mei 2023',
              debtClearingDate: null,
              debtClearingDateFormatted: null,
              amountOriginal: 2500,
              amountOriginalFormatted: '€ 2.500,00',
              factuurNummer: 'F005',
              factuurNummerEl: 'F005',
              status: 'openstaand',
              statusDescription: 'Openstaand description',
              paylink: 'https://payment.example.com/F005',
              documentDownloadLink: 'https://download.example.com/F005',
            },
          ],
        },
        afgehandeld: { facturen: [], count: 0 },
        overgedragen: { facturen: [], count: 0 },
      },
    },
  },
} as unknown as AppState;

describe('<AfisFacturen />', () => {
  const routePath = routeConfig.listPage.path;

  test('Lists Open facturen', async () => {
    const routeEntry = generatePath(routePath, {
      state: 'open',
      page: null,
    });

    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={AfisList}
          state={testState}
        />
      );
    }
    const screen = render(<Component />);

    await waitFor(() => {
      expect(screen.getByText('15 mei 2023')).toBeInTheDocument();
      expect(screen.getByText('Openstaand description')).toBeInTheDocument();
      expect(screen.getByText('Company E')).toBeInTheDocument();
    });
  });

  test('Lists Closed facturen', async () => {
    bffApi
      .get(
        `/services/afis/facturen/afgehandeld?id=${businessPartnerIdEncrypted}`
      )
      .reply(200, {
        content: {
          count: 1,
          state: 'afgehandeld',
          facturen: [
            {
              id: '1',
              factuurDocumentId: '1',
              afzender: 'Company D',
              datePublished: '2023-04-01',
              datePublishedFormatted: '1 april 2023',
              paymentDueDate: '2023-05-01',
              paymentDueDateFormatted: '1 mei 2023',
              debtClearingDate: null,
              debtClearingDateFormatted: null,
              amountOriginal: 1500,
              amountOriginalFormatted: '€ 1.500,00',
              factuurNummer: 'F001',
              factuurNummerEl: 'F001',
              status: 'betaald',
              statusDescription: 'Betaalde description',
              paylink: null,
              documentDownloadLink: 'https://download.example.com/F004',
            },
          ],
        },
        status: 'OK',
      });

    const routeEntry = generatePath(routePath, {
      state: 'afgehandeld',
      page: null,
    });

    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={AfisList}
          state={testState}
        />
      );
    }
    const screen = render(<Component />);

    await waitFor(() => {
      expect(screen.getByText('Company D')).toBeInTheDocument();
      expect(screen.getByText('Betaalde description')).toBeInTheDocument();
      expect(screen.queryByText('15 mei 2023')).not.toBeInTheDocument();
    });
  });

  // test('Partial error display', () => {});

  // test('Error display', () => {});
});

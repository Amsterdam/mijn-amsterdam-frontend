import { render, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import { bffApi } from '../../../test-utils';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { AfisFacturen } from './AfisFacturen';

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
  const routePath = AppRoutes['AFIS/FACTUREN'];

  test('Lists Open facturen', async () => {
    bffApi
      .get(`/services/afis/facturen/overzicht?id=${businessPartnerIdEncrypted}`)
      .reply(200, {
        content: {
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
                amountOwed: 2500,
                amountOwedFormatted: '€ 2.500,00',
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
        status: 'OK',
      });

    const routeEntry = generatePath(routePath, {
      state: 'open',
    });

    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={AfisFacturen}
        initializeState={initializeState}
      />
    );
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
          afgehandeld: {
            count: 1,
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
                amountOwed: 1500,
                amountOwedFormatted: '€ 1.500,00',
                factuurNummer: 'F001',
                factuurNummerEl: 'F001',
                status: 'betaald',
                statusDescription: 'Betaalde description',
                paylink: null,
                documentDownloadLink: 'https://download.example.com/F004',
              },
            ],
          },
        },
        status: 'OK',
      });

    bffApi
      .get(`/services/afis/facturen/overzicht?id=${businessPartnerIdEncrypted}`)
      .reply(200, {
        content: {
          open: { count: 0, facturen: [] },
          afgehandeld: { facturen: [], count: 0 },
          overgedragen: { facturen: [], count: 0 },
        },
        status: 'OK',
      });

    const routeEntry = generatePath(routePath, {
      state: 'afgehandeld',
    });

    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={AfisFacturen}
        initializeState={initializeState}
      />
    );
    const screen = render(<Component />);

    await waitFor(() => {
      expect(screen.getByText('Company D')).toBeInTheDocument();
      expect(screen.getByText('Betaalde description')).toBeInTheDocument();
      expect(screen.queryByText('15 mei 2023')).not.toBeInTheDocument();
    });
  });

  test('Partial error display', () => {});

  test('Error display', () => {});
});

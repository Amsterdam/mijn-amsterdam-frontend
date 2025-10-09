import { render, screen } from '@testing-library/react';

import type { AfisFactuurFrontend } from './Afis-thema-config';
import { AfisFactuur } from './AfisFactuur';
import type { AfisThemaResponse } from '../../../../server/services/afis/afis-types';
import { bffApi } from '../../../../testing/utils';
import type { ApiResponse } from '../../../../universal/helpers/api';
import MockApp from '../../MockApp';

const mockFactuur: AfisFactuurFrontend = {
  factuurNummer: '12345',
  paymentDueDateFormatted: '2023-10-01',
  afzender: 'Gemeente Amsterdam',
  statusDescription: 'Betaald',
};

const testState: Record<'AFIS', ApiResponse<AfisThemaResponse>> = {
  AFIS: {
    status: 'OK',
    content: {
      facturen: {
        open: {
          facturen: [mockFactuur],
          count: 1,
          state: 'open',
        },
      },
      isKnown: true,
      businessPartnerIdEncrypted: '123123123',
    },
  },
};

describe('<AfisFactuur />', () => {
  const routePath = '/afis/factuur/:factuurNummer/:state';

  function Component({ entry }: { entry: string }) {
    return (
      <MockApp
        routeEntry={entry}
        routePath={routePath}
        component={AfisFactuur}
        state={testState}
      />
    );
  }

  test('renders factuur details correctly', async () => {
    render(
      <Component entry={`/afis/factuur/${mockFactuur.factuurNummer}/open`} />
    );

    expect(await screen.findByText('Factuurnummer')).toBeInTheDocument();
    expect(screen.getByText(mockFactuur.factuurNummer)).toBeInTheDocument();
    expect(screen.getByText('Vervaldatum')).toBeInTheDocument();
    expect(
      screen.getByText(mockFactuur.paymentDueDateFormatted)
    ).toBeInTheDocument();
    expect(screen.getByText('Afzender')).toBeInTheDocument();
    expect(screen.getByText(mockFactuur.afzender)).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText(mockFactuur.statusDescription)).toBeInTheDocument();
  });

  test('shows warning when factuur is not found', async () => {
    render(<Component entry="/afis/factuur/000/open" />);

    expect(
      await screen.findByText('Factuur niet gevonden')
    ).toBeInTheDocument();
    expect(screen.getByText('Ga terug naar het overzicht')).toBeInTheDocument();
  });

  test('fetches facturen from closed state', async () => {
    bffApi.get('/services/afis/facturen/closed?id=123123123').reply(200, {
      status: 'OK',
      content: {
        count: 1,
        facturen: [mockFactuur],
        state: 'closed',
      },
    });
    render(
      <Component entry={`/afis/factuur/${mockFactuur.factuurNummer}/closed`} />
    );

    expect(await screen.findByText('Factuurnummer')).toBeInTheDocument();
    expect(screen.getByText(mockFactuur.statusDescription)).toBeInTheDocument();
  });
});

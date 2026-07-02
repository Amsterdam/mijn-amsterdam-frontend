import { render, screen } from '@testing-library/react';

import { AfisFactuur } from './AfisFactuur.tsx';
import type {
  AfisThemaResponse,
  AfisFactuur as AfisFactuurType,
  AfisEMandateFrontend,
} from '../../../../server/services/afis/afis-types.ts';
import { bffApi } from '../../../../testing/utils.ts';
import type { ApiResponse } from '../../../../universal/helpers/api.ts';
import { MockApp } from '../../MockApp.tsx';

const mockFactuur = {
  factuurNummer: '12345',
  paymentDueDateFormatted: '2023-10-01',
  afzender: 'Gemeente Amsterdam',
  statusDescription: 'Betaald',
  eMandateId: '100000078',
  link: {
    to: '/facturen-en-betalen/factuur/open/12345',
    title: 'Factuur 12345',
  },
} as unknown as AfisFactuurType;

const eMandate: AfisEMandateFrontend = {
  id: '100000078',
  eMandateIdSource: '100000078',
  creditorName: '',
  creditorIBAN: '',
  businessPartnerId: '',
  status: '1',
  displayStatus: 'Actief',
  history: [],
  senderIBAN: null,
  senderName: null,
  dateValidFrom: '2023-04-22',
  dateValidFromFormatted: '22 april 2023',
  dateValidTo: '9999-12-31',
  dateValidToFormatted: '31 december 9999',
  link: { to: '', title: '' },
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
        afgehandeld: null,
        overgedragen: null,
      },
      isKnown: true,
      businessPartnerIdEncrypted: '123123123',
    },
  },
};

function mockEmandatesApiRequest(content: unknown = []) {
  bffApi
    .get('/services/afis/e-mandates?id=123123123')
    .reply(200, { content, status: 'OK' });
}

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
    mockEmandatesApiRequest([eMandate]);

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
    expect(screen.getByText('Incassomachtiging kenmerk')).toBeInTheDocument();
    expect(screen.getByText(eMandate.eMandateIdSource!)).toBeInTheDocument();
    expect(screen.getByText('Incassomachtiging status')).toBeInTheDocument();
    expect(
      await screen.findByText('Actief sinds 22 april 2023.')
    ).toBeInTheDocument();
  });

  test('renders factuur details correctly when eMandate is not found', async () => {
    mockEmandatesApiRequest([]);

    render(
      <Component entry={`/afis/factuur/${mockFactuur.factuurNummer}/open`} />
    );

    expect(screen.getByText('Incassomachtiging kenmerk')).toBeInTheDocument();
    expect(screen.getByText(eMandate.eMandateIdSource!)).toBeInTheDocument();
    expect(screen.getByText('Incassomachtiging status')).toBeInTheDocument();
    expect(await screen.findByText('Niet meer actief')).toBeInTheDocument();
  });

  test('shows warning when factuur is not found', async () => {
    mockEmandatesApiRequest();

    render(<Component entry="/afis/factuur/000/open" />);

    expect(
      await screen.findByText('Factuur niet gevonden')
    ).toBeInTheDocument();
    expect(screen.getByText('Ga terug naar het overzicht')).toBeInTheDocument();
  });

  test('fetches facturen from closed state', async () => {
    mockEmandatesApiRequest();

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

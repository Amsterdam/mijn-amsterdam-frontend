import { fireEvent, render, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router';

import type {
  AfisBusinessPartnerDetailsTransformed,
  AfisFacturenOverviewResponse,
} from '../../../../../../server/services/afis/afis-types.ts';
import { bffApi } from '../../../../../../testing/utils.ts';
import type { AppState } from '../../../../../../universal/types/App.types.ts';
import { MockApp } from '../../MockApp.tsx';
import { themaConfig } from './Afis-thema-config.ts';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren.tsx';
import { AfisThema } from './AfisThema.tsx';

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
        eMandateId: null,
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
        eMandateId: null,
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
        eMandateId: null,
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
  function createAccountState(selectionKey: string): AppState {
    return {
      ...testState,
      AFIS: {
        ...testState.AFIS,
        content: {
          ...testState.AFIS.content,
          selectionKey,
          accounts: [
            {
              id: 'general',
              name: 'Algemeen',
              vestigingsnummer: null,
              businessPartnerIdEncrypted,
            },
            {
              id: 'branch',
              name: 'Vestiging Oost',
              vestigingsnummer: '000038509490',
              businessPartnerIdEncrypted: 'branch-reference',
            },
          ],
        },
      },
    } as AppState;
  }

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

  function Component({ state = testState }: { state?: AppState }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={AfisThema}
        state={state}
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

  it('keeps the requested account on error and retries without showing previous invoices', async () => {
    const state = createAccountState('invoice-retry-test');
    bffApi
      .get('/services/afis/facturen/overzicht?id=branch-reference')
      .reply(500, { status: 'ERROR', content: null, message: 'Unavailable' });
    bffApi
      .get('/services/afis/facturen/overzicht?id=branch-reference')
      .reply(200, {
        status: 'OK',
        content: {
          ...mockFacturen,
          open: {
            state: 'open',
            count: 1,
            facturen: [
              {
                ...mockFacturen.open!.facturen[0],
                afzender: 'Herstelde vestiging',
              },
            ],
          },
        },
      });
    const page = render(<Component state={state} />);

    fireEvent.change(page.getByRole('combobox', { name: 'Vestiging' }), {
      target: { value: 'branch' },
    });
    fireEvent.click(
      await page.findByRole('button', { name: 'Opnieuw proberen' })
    );

    expect(page.getByRole('combobox', { name: 'Vestiging' })).toHaveValue(
      'branch'
    );
    expect(page.queryByText('Company A')).not.toBeInTheDocument();
    expect(await page.findByText('Herstelde vestiging')).toBeInTheDocument();
  });

  it('shares selection with Betaalvoorkeuren and retains it after remounting', async () => {
    const stateWithAccounts = {
      ...testState,
      AFIS: {
        ...testState.AFIS,
        content: {
          ...testState.AFIS.content,
          accounts: [
            {
              id: 'general',
              name: 'Algemeen',
              vestigingsnummer: null,
              businessPartnerIdEncrypted,
            },
            {
              id: 'branch',
              name: 'Vestiging Oost',
              vestigingsnummer: '000038509490',
              businessPartnerIdEncrypted: 'branch-reference',
            },
          ],
          isRestricted: false,
          selectionKey: 'invoice-switch-test',
        },
      },
    } as AppState;
    bffApi
      .get('/services/afis/facturen/overzicht?id=branch-reference')
      .reply(200, {
        status: 'OK',
        content: {
          ...mockFacturen,
          open: {
            state: 'open',
            count: 1,
            facturen: [
              {
                ...mockFacturen.open!.facturen[0],
                afzender: 'Vestiging Oost factuur',
              },
            ],
          },
          afgehandeld: { state: 'afgehandeld', count: 0, facturen: [] },
        },
      });

    const screen = render(<Component state={stateWithAccounts} />);

    expect(screen.getByText('Company A')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Vestiging' }), {
      target: { value: 'branch' },
    });
    expect(screen.queryByText('Company A')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Vestiging' })).toHaveValue(
        'branch'
      );
      expect(screen.queryByText('Company B')).not.toBeInTheDocument();
      expect(screen.getByText('Vestiging Oost factuur')).toBeInTheDocument();
    });
    screen.unmount();
    bffApi
      .get('/services/afis/businesspartner?id=branch-reference')
      .times(2)
      .reply(200, {
        status: 'OK',
        content: {
          businessPartnerId: 'branch',
          fullName: 'Vestiging Oost',
          email: 'oost@example.org',
        },
      });
    bffApi
      .get('/services/afis/e-mandates?id=branch-reference')
      .times(2)
      .reply(200, { status: 'OK', content: [] });
    const betaalvoorkeuren = render(
      <MockApp
        routeEntry={themaConfig.detailPageBetaalvoorkeuren.route.path}
        routePath={themaConfig.detailPageBetaalvoorkeuren.route.path}
        component={AfisBetaalVoorkeuren}
        state={stateWithAccounts}
      />
    );
    expect(
      await betaalvoorkeuren.findByText('oost@example.org')
    ).toBeInTheDocument();
    expect(
      betaalvoorkeuren.getByRole('combobox', { name: 'Vestiging' })
    ).toHaveValue('branch');
    betaalvoorkeuren.unmount();

    const invoices = render(<Component state={stateWithAccounts} />);
    expect(
      await invoices.findByText('Vestiging Oost factuur')
    ).toBeInTheDocument();
    expect(invoices.queryByText('Company A')).not.toBeInTheDocument();
  });
});

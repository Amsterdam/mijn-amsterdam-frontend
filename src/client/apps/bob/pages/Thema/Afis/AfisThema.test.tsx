import { fireEvent, render, waitFor } from '@testing-library/react';
import { generatePath, useLocation, useNavigate } from 'react-router';

import type {
  AfisBusinessPartnerDetailsTransformed,
  AfisFacturenOverviewResponse,
} from '../../../../../../server/services/afis/afis-types.ts';
import { bffApi } from '../../../../../../testing/utils.ts';
import type { AppState } from '../../../../../../universal/types/App.types.ts';
import { ApplicationRoutes } from '../../../../../components/ApplicationRoutes/ApplicationRoutes.tsx';
import { MockApp } from '../../MockApp.tsx';
import { afisAccountRoutePatterns, themaConfig } from './Afis-thema-config.ts';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren.tsx';
import { AfisFactuur } from './AfisFactuur.tsx';
import { AfisList } from './AfisList.tsx';
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

  function RoutedPage({
    state,
    routeEntry: entry = routeEntry,
  }: {
    state: AppState;
    routeEntry?: string;
  }) {
    return (
      <MockApp
        routeEntry={entry}
        routePath="*"
        component={RoutedComponent}
        state={state}
      />
    );
  }

  function RoutedComponent() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    return (
      <>
        <output data-testid="current-path">{pathname}</output>
        <button onClick={() => navigate(-1)}>Terug</button>
        <ApplicationRoutes
          routes={[
            {
              route: afisAccountRoutePatterns.overview,
              Component: AfisThema,
            },
            {
              route: afisAccountRoutePatterns.listPage,
              Component: AfisList,
            },
            {
              route: afisAccountRoutePatterns.detailPage,
              Component: AfisFactuur,
            },
            {
              route: themaConfig.route.path,
              Component: AfisThema,
            },
            {
              route: afisAccountRoutePatterns.betaalVoorkeuren,
              Component: AfisBetaalVoorkeuren,
            },
          ]}
        />
      </>
    );
  }

  function MultiAccountState(): AppState {
    return createAccountState('url-selection-test');
  }

  it('Matches the Full Page snapshot', async () => {
    const screen = render(<Component />);
    expect(screen.asFragment()).toMatchSnapshot();

    await waitFor(() => {
      expect(screen.getByText('Company B')).toBeInTheDocument();
    });
  });

  it('lists every account with its open-invoice count before displaying selected invoices', async () => {
    const state = MultiAccountState();
    bffApi
      .get('/services/afis/facturen/overzicht?id=branch-reference')
      .reply(200, {
        status: 'OK',
        content: {
          ...mockFacturen,
          open: {
            state: 'open',
            count: 6,
            facturen: [
              {
                ...mockFacturen.open!.facturen[0],
                afzender: 'Vestiging Oost',
              },
            ],
          },
        },
      });

    const page = render(
      <MockApp
        routeEntry="/facturen-en-betalen"
        routePath="*"
        component={RoutedComponent}
        state={state}
      />
    );

    expect(
      page.getByText(/Hieronder ziet u een overzicht van uw facturen/)
    ).toBeInTheDocument();
    expect(
      page.getByRole('heading', { name: 'Kies een vestiging' })
    ).toBeInTheDocument();
    expect(page.getByRole('link', { name: /Algemeen/ })).toHaveAttribute(
      'href',
      '/facturen-en-betalen/vestiging/general'
    );
    const branchLink = page.getByRole('link', {
      name: /Vestiging Oost - 000038509490/,
    });
    expect(page.getByRole('table').closest('.ams-grid__cell')).toHaveClass(
      'ams-grid__cell--span-12-wide'
    );
    expect(branchLink).toHaveAttribute(
      'href',
      '/facturen-en-betalen/vestiging/branch'
    );
    const pageLinks = page.container.querySelector('.ams-link-list');
    expect(
      pageLinks !== null &&
        !!(
          pageLinks.compareDocumentPosition(branchLink) &
          Node.DOCUMENT_POSITION_FOLLOWING
        )
    ).toBe(true);
    expect(page.getByRole('cell', { name: '2' })).toBeInTheDocument();
    await waitFor(() => {
      expect(page.getByRole('cell', { name: '6' })).toBeInTheDocument();
    });
    expect(
      page.queryByRole('heading', { name: 'Automatische incasso' })
    ).not.toBeInTheDocument();
    expect(page.queryByText('Company A')).not.toBeInTheDocument();

    fireEvent.click(branchLink);

    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen/vestiging/branch'
      );
      expect(page.getByText('Vestiging Oost')).toBeInTheDocument();
      expect(
        page.queryByRole('heading', { name: 'Kies een vestiging' })
      ).not.toBeInTheDocument();
      expect(
        page
          .getAllByRole('link', { name: 'Facturen en betalen' })
          .some((link) => link.getAttribute('href') === '/facturen-en-betalen')
      ).toBe(true);
      expect(
        page.getByRole('link', { name: 'Ga naar betaalvoorkeuren' })
      ).toHaveAttribute(
        'href',
        '/facturen-en-betalen/vestiging/branch/betaalvoorkeuren'
      );
      expect(
        page.getByRole('link', { name: 'Alle openstaande facturen' })
      ).toHaveAttribute(
        'href',
        '/facturen-en-betalen/vestiging/branch/facturen/lijst/open'
      );
      expect(page.getByRole('link', { name: 'F001' })).toHaveAttribute(
        'href',
        '/facturen-en-betalen/vestiging/branch/factuur/open/F001'
      );
      expect(
        page.getByRole('heading', { name: 'Automatische incasso' })
      ).toBeInTheDocument();
      expect(
        page
          .getByRole('heading', { name: 'Automatische incasso' })
          .closest('.ams-grid__cell')
          ?.previousElementSibling?.querySelector('.ams-link-list')
      ).toBeInTheDocument();
    });

    bffApi
      .get('/services/afis/businesspartner?id=branch-reference')
      .reply(200, {
        status: 'OK',
        content: businessPartnerDetails,
      });
    bffApi
      .get('/services/afis/e-mandates?id=branch-reference')
      .reply(200, { status: 'OK', content: [] });

    fireEvent.click(
      page.getByRole('link', { name: 'Alle openstaande facturen' })
    );
    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen/vestiging/branch/facturen/lijst/open'
      );
      expect(
        page
          .getAllByRole('link', { name: 'Facturen en betalen' })
          .some(
            (link) =>
              link.getAttribute('href') ===
              '/facturen-en-betalen/vestiging/branch'
          )
      ).toBe(true);
    });

    fireEvent.click(page.getByRole('button', { name: 'Terug' }));
    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen/vestiging/branch'
      );
    });

    fireEvent.click(page.getByRole('link', { name: 'F001' }));
    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen/vestiging/branch/factuur/open/F001'
      );
      expect(
        page
          .getAllByRole('link', { name: 'Facturen en betalen' })
          .some(
            (link) =>
              link.getAttribute('href') ===
              '/facturen-en-betalen/vestiging/branch'
          )
      ).toBe(true);
    });

    fireEvent.click(page.getByRole('button', { name: 'Terug' }));
    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen/vestiging/branch'
      );
    });

    fireEvent.click(
      page.getByRole('link', { name: 'Ga naar betaalvoorkeuren' })
    );
    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen/vestiging/branch/betaalvoorkeuren'
      );
      expect(
        page
          .getAllByRole('link', { name: 'Facturen en betalen' })
          .some(
            (link) =>
              link.getAttribute('href') ===
              '/facturen-en-betalen/vestiging/branch'
          )
      ).toBe(true);
    });

    fireEvent.click(page.getByRole('button', { name: 'Terug' }));
    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen/vestiging/branch'
      );
    });

    fireEvent.click(page.getByRole('button', { name: 'Terug' }));
    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen'
      );
      expect(
        page.getByRole('heading', { name: 'Kies een vestiging' })
      ).toBeInTheDocument();
    });
  });

  it('selects and routes directly when exactly one account is available', async () => {
    const state = {
      ...testState,
      AFIS: {
        ...testState.AFIS,
        content: {
          ...testState.AFIS.content,
          selectionKey: 'single-account-test',
          accounts: [
            {
              id: 'general',
              name: 'Algemeen',
              vestigingsnummer: null,
              businessPartnerIdEncrypted,
            },
          ],
        },
      },
    } as AppState;
    const page = render(<RoutedPage state={state} />);

    await waitFor(() => {
      expect(page.getByTestId('current-path')).toHaveTextContent(
        '/facturen-en-betalen/vestiging/general'
      );
      expect(page.getByText('Company A')).toBeInTheDocument();
    });
    expect(
      page.queryByRole('heading', { name: 'Kies een vestiging' })
    ).not.toBeInTheDocument();
  });

  it('does not show data for an unknown account in the URL', async () => {
    const page = render(
      <RoutedPage
        state={MultiAccountState()}
        routeEntry="/facturen-en-betalen/vestiging/unknown"
      />
    );

    expect(
      await page.findByText(/Deze vestiging is niet beschikbaar/)
    ).toBeInTheDocument();
    expect(page.queryByText('Company A')).not.toBeInTheDocument();
    expect(page.queryByText('Company B')).not.toBeInTheDocument();
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
    const page = render(<RoutedPage state={state} />);

    fireEvent.click(
      page.getByRole('link', { name: /Vestiging Oost - 000038509490/ })
    );
    fireEvent.click(
      await page.findByRole('button', { name: 'Opnieuw proberen' })
    );

    expect(page.getByTestId('current-path')).toHaveTextContent(
      '/facturen-en-betalen/vestiging/branch'
    );
    expect(page.queryByText('Company A')).not.toBeInTheDocument();
    expect(await page.findByText('Herstelde vestiging')).toBeInTheDocument();
  });

  it('uses the URL account on Betaalvoorkeuren without rendering a selector', async () => {
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

    const screen = render(<RoutedPage state={stateWithAccounts} />);
    expect(screen.queryByText('Company A')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole('link', { name: /Vestiging Oost - 000038509490/ })
    );
    await waitFor(() => {
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
        routeEntry="/facturen-en-betalen/vestiging/branch/betaalvoorkeuren"
        routePath="/facturen-en-betalen/vestiging/:zakenpartnernummer/betaalvoorkeuren"
        component={AfisBetaalVoorkeuren}
        state={stateWithAccounts}
      />
    );
    expect(
      await betaalvoorkeuren.findByText('oost@example.org')
    ).toBeInTheDocument();
    expect(
      betaalvoorkeuren.queryByRole('heading', { name: 'Kies een vestiging' })
    ).not.toBeInTheDocument();
    betaalvoorkeuren.unmount();
  });
});

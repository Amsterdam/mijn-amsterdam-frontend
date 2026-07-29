import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { generatePath } from 'react-router';
import { vi } from 'vitest';

import { themaConfig } from './HLI-thema-config.ts';
import { HLIStadspasDetail } from './HLIStadspasDetail.tsx';
import { forTesting } from './HLIStadspasDetail.tsx';
import { createHLIState } from './test-helpers.ts';
import { stadspasCreator } from './test-helpers.ts';
import type { StadspasBudget } from '../../../../server/services/hli/stadspas-types.ts';
import { bffApi } from '../../../../testing/utils.ts';
import { componentCreator } from '../../MockApp.tsx';

const createStadspas = stadspasCreator();
const passNumber = 12345678;

const activePasState = createHLIState({
  stadspas: [
    createStadspas({ actief: true, passNumber }, { firstname: 'Kerub' }),
  ],
});

const pasBlockedState = createHLIState({
  stadspas: [
    createStadspas({ actief: false, passNumber }, { firstname: 'Lou' }),
  ],
});
const pasKindTypeState = createHLIState({
  stadspas: [
    createStadspas({ type: 'kind', passNumber }, { firstname: 'Noa' }),
  ],
});

const pasVolwasseneTypeState = createHLIState({
  stadspas: [
    createStadspas({ type: 'volwassene', passNumber }, { firstname: 'Piet' }),
  ],
});

const pasUnknownTypeState = createHLIState({
  stadspas: [
    createStadspas({ type: 'onbekend', passNumber }, { firstname: 'Onbekend' }),
  ],
});

const createHLIStadspasComponent = componentCreator({
  component: HLIStadspasDetail,
  routePath: themaConfig.stadspasDetailPage.route.path,
  routeEntry: generatePath(themaConfig.stadspasDetailPage.route.path, {
    passNumber: `${passNumber}`,
  }),
});

describe('Stadspas detail page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    bffApi.get('/url-transactions').reply(200, { content: [] });
  });

  test('Matches snapshot', () => {
    const HLIStadspas = createHLIStadspasComponent(activePasState);
    const { asFragment } = render(<HLIStadspas />);

    expect(asFragment()).toMatchSnapshot();
  });

  test('Active pas state', () => {
    const HLIStadspas = createHLIStadspasComponent(activePasState);
    const screen = render(<HLIStadspas />);

    expect(
      screen.getByText(/Hieronder staat het Stadspasnummer van uw actieve pas./)
    ).toBeInTheDocument();

    expect(screen.getByText('Status').nextElementSibling).toHaveTextContent(
      'Actief'
    );

    expect(
      screen.getByRole('button', { name: 'Blokkeer deze Stadspas' })
    ).toBeInTheDocument();

    expect(screen.queryByText(/^Saldo$/)).not.toBeInTheDocument();
  });

  test('Blocked pas state', () => {
    const HLIStadspas = createHLIStadspasComponent(pasBlockedState);
    const screen = render(<HLIStadspas />);

    expect(
      screen.getByText(
        /Hieronder staat het Stadspasnummer van uw geblokkeerde pas./
      )
    ).toBeInTheDocument();

    expect(screen.getByText('Status').nextElementSibling).toHaveTextContent(
      'Geblokkeerd'
    );

    expect(
      screen.getByRole('heading', {
        name: 'Deze pas heeft u geblokkeerd, hoe nu verder?',
      })
    ).toBeInTheDocument();
  });

  it("displays pas type 'kind'", () => {
    const HLIStadspas = createHLIStadspasComponent(pasKindTypeState);
    const screen = render(<HLIStadspas />);

    expect(screen.getByText('Pastype').nextElementSibling).toHaveTextContent(
      'Kind'
    );
  });

  it("displays pas type 'Volwassen'", () => {
    const HLIStadspas = createHLIStadspasComponent(pasVolwasseneTypeState);
    const screen = render(<HLIStadspas />);

    expect(screen.getByText('Pastype').nextElementSibling).toHaveTextContent(
      'Volwassen'
    );
  });

  it("displays pas type 'Onbekend'", () => {
    const HLIStadspas = createHLIStadspasComponent(pasUnknownTypeState);
    const screen = render(<HLIStadspas />);

    expect(screen.getByText('Pastype').nextElementSibling).toHaveTextContent(
      'Onbekend'
    );
  });

  test("Appears with all it's buttons", async () => {
    const HLIStadspas = createHLIStadspasComponent(activePasState);
    const screen = render(<HLIStadspas />);
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: 'Blokkeer deze Stadspas' })
    );

    const heading = screen.getByRole('heading', {
      name: 'Uw pas is gestolen of u bent deze kwijt.',
    });
    expect(heading).toBeInTheDocument();

    const blockButton = screen.getByRole('button', {
      name: 'Ja, blokkeer mijn pas',
    });
    expect(blockButton).toBeInTheDocument();

    const declineButton = screen.getByRole('button', {
      name: 'Nee, blokkeer mijn pas niet',
    });
    expect(declineButton).toBeInTheDocument();
  });

  test('shows Meer informatie link when budget has readMoreLink', () => {
    const Component = createHLIStadspasComponent(
      createHLIState({
        stadspas: [
          createStadspas({
            actief: true,
            passNumber,
            budgets: [
              {
                title: 'Kindtegoed 10-14',
                description: 'Kindtegoed',
                budgetAssigned: 150,
                budgetAssignedFormatted: '€150,00',
                budgetBalance: 132,
                budgetBalanceFormatted: '€132,00',
                code: 'AMSTEG_10-14',
                dateEnd: '2080-08-31T21:59:59.000Z',
                dateEndFormatted: '31 augustus 2080',
                readMoreLink: {
                  to: 'https://www.amsterdam.nl/stadspas/kindtegoed/',
                  title:
                    'Lees meer over de kindtegoed Kindtegoed 10-14 regeling op amsterdam.nl.',
                },
              },
            ],
          }),
        ],
      })
    );
    const screen = render(<Component />);

    const link = screen.getByRole('link', { name: /Meer informatie/ });
    expect(link).toHaveAttribute(
      'href',
      'https://www.amsterdam.nl/stadspas/kindtegoed/'
    );
  });

  test('shows heading and budget column for balance', () => {
    const Component = createHLIStadspasComponent(
      createHLIState({
        stadspas: [
          createStadspas({
            actief: true,
            passNumber,
            budgets: [
              {
                title: 'Kindtegoed 10-14',
                description: 'Kindtegoed',
                budgetAssigned: 150,
                budgetAssignedFormatted: '€150,00',
                budgetBalance: 132,
                budgetBalanceFormatted: '€132,00',
                code: 'AMSTEG_10-14',
                dateEnd: '2080-08-31T21:59:59.000Z',
                dateEndFormatted: '31 augustus 2080',
                readMoreLink: null,
              },
            ],
          }),
        ],
      })
    );

    const screen = render(<Component />);

    expect(
      screen.getByRole('heading', { name: 'Tegoeden', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Bedrag' })
    ).toBeInTheDocument();
  });

  test('shows pc budget warning when at least one budget code matches the PC pattern', () => {
    const Component = createHLIStadspasComponent(
      createHLIState({
        stadspas: [
          createStadspas({
            actief: true,
            passNumber,
            budgets: [
              {
                title: '25/26 PC Tegoed',
                description: '',
                budgetAssigned: 580,
                budgetAssignedFormatted: '€580,00',
                budgetBalance: 0,
                budgetBalanceFormatted: '€0,00',
                code: '2025_AMSTEG_PC',
                dateEnd: '2026-07-31T21:59:59.000Z',
                dateEndFormatted: '31 juli 2026',
                readMoreLink: null,
              },
              {
                title: 'Witgoedregeling',
                description: 'Witgoedregeling',
                budgetAssigned: 300,
                budgetAssignedFormatted: '€300,00',
                budgetBalance: 0,
                budgetBalanceFormatted: '€0,00',
                code: 'WITGOEDREGELING',
                dateEnd: '2025-03-25T21:59:59.000Z',
                dateEndFormatted: '25 maart 2025',
                readMoreLink: null,
              },
            ],
          }),
        ],
      })
    );

    const screen = render(<Component />);

    expect(
      screen.getByText(
        'U mag het PC-tegoed 1 keer gebruiken. Geld dat overblijft na een aankoop kunt u niet meer uitgeven.'
      )
    ).toBeInTheDocument();
  });

  test('does not show pc budget warning when no budget code matches the PC pattern', () => {
    const Component = createHLIStadspasComponent(
      createHLIState({
        stadspas: [
          createStadspas({
            actief: true,
            passNumber,
            budgets: [
              {
                title: 'Kindtegoed 10-14',
                description: 'Kindtegoed',
                budgetAssigned: 150,
                budgetAssignedFormatted: '€150,00',
                budgetBalance: 132,
                budgetBalanceFormatted: '€132,00',
                code: 'AMSTEG_10-14',
                dateEnd: '2080-08-31T21:59:59.000Z',
                dateEndFormatted: '31 augustus 2080',
                readMoreLink: null,
              },
            ],
          }),
        ],
      })
    );

    const screen = render(<Component />);

    expect(
      screen.queryByText(
        'Let op: u kunt het PC tegoed maar één keer gebruiken. Het geld dat u niet gebruikt, gaat verloren.'
      )
    ).not.toBeInTheDocument();
  });
});

describe('Displayed description of uw uitgaven text', () => {
  test('Without budget or expenses', () => {
    const result = forTesting.determineUwUitgavenDescription(
      createStadspas(),
      false
    );
    expect(result).toMatchInlineSnapshot(`
      <React.Fragment>
        U heeft nog geen uitgaven.
      </React.Fragment>
    `);
  });

  test('With budget, balance and transactions', () => {
    const budget: StadspasBudget = {
      title: 'The Title',
      description: 'Some description',
      budgetAssigned: 4,
      budgetAssignedFormatted: '€4,00',
      budgetBalance: 5,
      budgetBalanceFormatted: '€5,00',
      code: '123-code-123',
      dateEnd: '01-01-2080',
      dateEndFormatted: '01-01-2080',
      readMoreLink: null,
    };

    const result = forTesting.determineUwUitgavenDescription(
      createStadspas({ budgets: [budget], balance: 5 }),
      false
    );
    // prettier-ignore
    expect(result).toMatchInlineSnapshot(`
      <React.Fragment>
        <React.Fragment>
          U heeft nog geen uitgaven.
        </React.Fragment>
        <React.Fragment>
          Deze informatie kan een dag achterlopen. Maar het saldo dat u nog over heeft klopt altijd.
        </React.Fragment>
      </React.Fragment>
    `);
  });
});

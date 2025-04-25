import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router';

import { routeConfig } from './HLI-thema-config';
import { HLIStadspasDetail } from './HLIStadspasDetail';
import { forTesting } from './HLIStadspasDetail';
import { createHLIState } from './test-helpers';
import { stadspasCreator } from './test-helpers';
import { StadspasBudget } from '../../../../server/services/hli/stadspas-types';
import { bffApi } from '../../../../testing/utils';
import { componentCreator } from '../../MockApp';

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

const createHLIStadspasComponent = componentCreator({
  component: HLIStadspasDetail,
  routePath: routeConfig.detailPageStadspas.path,
  routeEntry: generatePath(routeConfig.detailPageStadspas.path, {
    passNumber: `${passNumber}`,
  }),
});

describe('With basic request where data returned does not matter', () => {
  beforeEach(() => {
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

    expect(
      screen.getByRole('button', { name: 'Blokkeer deze Stadspas' })
    ).toBeInTheDocument();
  });

  test('Blocked pas state', () => {
    const HLIStadspas = createHLIStadspasComponent(pasBlockedState);
    const screen = render(<HLIStadspas />);

    expect(
      screen.getByText(
        /Hieronder staat het Stadspasnummer van uw geblokkeerde pas./
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Deze pas heeft u geblokkeerd, hoe nu verder?',
      })
    ).toBeInTheDocument();
  });

  test("Appears with all it's buttons", async () => {
    const HLIStadspas = createHLIStadspasComponent(activePasState);
    const screen = render(<HLIStadspas />);
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', { name: 'Blokkeer deze Stadspas' })
    );

    const heading = screen.getByRole('heading', {
      name: 'Weet u zeker dat u uw Stadspas wilt blokkeren?',
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

  test('With transactions', () => {
    const result = forTesting.determineUwUitgavenDescription(
      createStadspas(),
      true
    );

    expect(result).toMatchInlineSnapshot(`
      <React.Fragment>
        Hieronder ziet u bij welke winkels u het tegoed hebt uitgegeven. Deze informatie kan een dag achterlopen. Maar het saldo dat u nog over heeft klopt altijd.
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

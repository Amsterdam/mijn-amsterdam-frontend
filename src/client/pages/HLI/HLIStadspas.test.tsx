import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router-dom';

import HLIStadspas from './HLIStadspas';
import { bffApi } from '../../../testing/utils';
import { AppState } from '../../../universal/types';
import { componentCreator } from '../MockApp';
import { stadspasCreator } from './test-helpers';
import { AppRoutes } from '../../../universal/config/routes';

const createStadspas = stadspasCreator();
const passNumber = 12345678;

const activePasState = {
  HLI: {
    status: 'OK',
    content: {
      regelingen: [],
      stadspas: [
        createStadspas({ actief: true, passNumber }, { firstname: 'Kerub' }),
      ],
    },
  },
} as unknown as AppState;

const pasBlockedState = {
  HLI: {
    status: 'OK',
    content: {
      regelingen: [],
      stadspas: [
        createStadspas({ actief: false, passNumber }, { firstname: 'Lou' }),
      ],
    },
  },
} as unknown as AppState;

const createHLIStadspasComponent = componentCreator({
  component: HLIStadspas,
  routePath: AppRoutes['HLI/STADSPAS'],
  routeEntry: generatePath(AppRoutes['HLI/STADSPAS'], { passNumber }),
});

describe('With basic request where data returned does not matter', () => {
  beforeEach(() => {
    bffApi.get('/url-transactions').reply(200, { content: [] });
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
    bffApi.persist().get('/url-transactions').reply(200, { content: [] });
    const HLIStadspas = createHLIStadspasComponent(pasBlockedState);
    const screen = render(<HLIStadspas />);

    expect(
      screen.getByText(
        /Hieronder staat het Stadspasnummer van uw geblokkeerde pas./
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Deze pas is geblokkeerd, hoe vraag ik een nieuwe aan?',
      })
    ).toBeInTheDocument();
  });

  test('Modal appears', async () => {
    bffApi.persist().get('/url-transactions').reply(200, { content: [] });

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

// describe('Displayed description of uw uitgaven text', () => {
// RP TODO: Enable one by one. the last two are not yet correct.
// test('Just text about not having made expenses', () => {
//   bffApi.persist().get('/url-transactions').reply(200, { content: [] });
//   const pas: StadspasFrontend = {
//     actief: true,
//     balance: 0,
//     balanceFormatted: '€0,00',
//     blockPassURL: null,
//     budgets: [],
//   };
//   const HLIStadspas = createHLIStadspasComponent(pas);
//   const screen = render(<HLIStadspas />);
//   expect(screen.getByText('U heeft nog geen uitgaven.')).toBeInTheDocument();
// });
//   test('Extra text with the word stores', () => {
//     bffApi.get('/url-transactions').reply(200, { content: ['item'] });
//     const HLIStadspas = createHLIStadspasComponent(activePasState);
//     const screen = render(<HLIStadspas />);
//     expect(
//       screen.getByText(`Hieronder ziet u bij welke winkels u het tegoed hebt uitgegeven. Deze
// informatie kan een dag achterlopen. Maar het saldo dat u nog over heeft
// klopt altijd.`)
//     ).toBeInTheDocument();
//   });
//   test('No expenses but with extra information', () => {
//     bffApi.get('/url-transactions').reply(200, { content: ['item'] });
//     const HLIStadspas = createHLIStadspasComponent(activePasState);
//     const screen = render(<HLIStadspas />);
//     expect(
//       screen.getByText(`U heeft nog geen uitgaven. Deze informatie kan een dag achterlopen.
// Maar het saldo dat u nog over heeft klopt altijd.`)
//     ).toBeInTheDocument();
//   });
// });

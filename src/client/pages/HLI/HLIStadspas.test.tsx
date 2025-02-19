import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';

import HLIStadspas from './HLIStadspas';
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
      stadspas: [createStadspas('Kerub', true, passNumber)],
    },
  },
} as unknown as AppState;

const pasBlockedState = {
  HLI: {
    status: 'OK',
    content: {
      regelingen: [],
      stadspas: [createStadspas('Lou', false, passNumber)],
    },
  },
} as unknown as AppState;

const createHLIStadspasComponent = componentCreator({
  component: HLIStadspas,
  routePath: AppRoutes['HLI/STADSPAS'],
  routeEntry: generatePath(AppRoutes['HLI/STADSPAS'], { passNumber }),
});

describe('<HLIStadspas />', () => {
  test('Find text indicating the pas is active', () => {
    const HLIStadspas = createHLIStadspasComponent(activePasState);
    const screen = render(<HLIStadspas />);
    expect(
      screen.getByText(/Hieronder staat het Stadspasnummer van uw actieve pas./)
    ).toBeInTheDocument();
  });

  test('Finds the block button', () => {
    const HLIStadspas = createHLIStadspasComponent(activePasState);
    const screen = render(<HLIStadspas />);
    expect(
      screen.getByRole('button', { name: 'Blokkeer deze Stadspas' })
    ).toBeInTheDocument();
  });

  test('Find texts communicating that the stadspas is blocked', () => {
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
});

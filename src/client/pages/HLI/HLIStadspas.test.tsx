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
  test('Finds the block button', () => {
    const HLIStadspas = createHLIStadspasComponent(activePasState);
    const screen = render(<HLIStadspas />);
    expect(screen.getByTestId('block-stadspas-button')).toBeInTheDocument();
  });

  test('Find label communicating that the stadspas is blocked', () => {
    const HLIStadspas = createHLIStadspasComponent(pasBlockedState);
    const screen = render(<HLIStadspas />);
    expect(screen.getByTestId('stadspas-blocked-alert')).toBeInTheDocument();
  });
});

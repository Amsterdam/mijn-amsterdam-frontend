import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';

import HLIStadspas from './HLIStadspas';
import { AppState } from '../../../universal/types';
import { componentCreator } from '../MockApp';
import { stadspasCreator } from './test-helpers';
import { AppRoutes } from '../../../universal/config/routes';

const createStadspas = stadspasCreator();
const passNumber = 12345678;

const testState = {
  HLI: {
    status: 'OK',
    content: {
      regelingen: [],
      stadspas: [createStadspas('Kerub', true, passNumber)],
    },
  },
} as unknown as AppState;

const createHLIStadspasComponent = componentCreator({
  component: HLIStadspas,
  routePath: AppRoutes['HLI/STADSPAS'],
  routeEntry: generatePath(AppRoutes['HLI/STADSPAS'], { passNumber }),
});

describe('<HLIStadspas />', () => {
  it('Finds the block button', () => {
    const HLIStadspas = createHLIStadspasComponent(testState);
    const screen = render(<HLIStadspas />);
    expect(screen.getByTestId('block-stadspas-button')).toBeInTheDocument();
  });
});

import { generatePath } from 'react-router';

import { componentCreator } from '../MockApp';
import { JeugdThemaPagina } from './JeugdThema';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { render } from '@testing-library/react';

const jeugdState: AppState['JEUGD'] = {
  content: [],
  status: 'OK',
};

const basicAppState = {
  JEUGD: jeugdState,
} as AppState;

const createComponent = componentCreator({
  component: JeugdThemaPagina,
  routeEntry: generatePath(AppRoutes.JEUGD),
  routePath: AppRoutes.JEUGD,
});

test('Important static elements', async () => {
  const Component = createComponent(basicAppState);
  const screen = render(<Component />);
  screen.getByRole('heading', { name: 'Onderwijs en Jeugd' });
  screen.getByText(/Bel dan gratis de Wmo Helpdesk/);

  // Finds phonenumber
  screen.getByText(/\d{4} \d{4}/);
});

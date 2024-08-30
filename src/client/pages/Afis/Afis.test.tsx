import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { AfisThemaPagina } from './Afis';

const testState = {} as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Afis />', () => {
  const routeEntry = generatePath(AppRoutes.AFIS);
  const routePath = AppRoutes.AFIS;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={AfisThemaPagina}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

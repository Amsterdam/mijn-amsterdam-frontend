import { render, screen } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../../pages/MockApp';
import Search from './Search';

const testState: any = {};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Search />', () => {
  const routeEntry = generatePath(AppRoutes.SEARCH);
  const routePath = AppRoutes.SEARCH;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Search}
      initializeState={initializeState}
    />
  );

  it('Renders without crashing', () => {
    render(<Component />);
  });
});

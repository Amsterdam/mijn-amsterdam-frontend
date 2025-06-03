import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import { describe, expect, it, vi } from 'vitest';

import { MainFooter } from './MainFooter';
import type { AppState } from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import { DashboardRoute } from '../../pages/Dashboard/Dashboard-routes';
import MockApp from '../../pages/MockApp';

vi.mock('../../hooks/media.hook');

const testState = {};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState as AppState);
}

describe('<MainFooter />', () => {
  const routeEntry = generatePath(DashboardRoute.route);
  const routePath = DashboardRoute.route;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={MainFooter}
        initializeState={initializeState}
      />
    );
  }

  it('Renders without crashing', () => {
    render(<Component />);
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Uit in Amsterdam')).toBeInTheDocument();
    expect(screen.getByText('Volg de gemeente')).toBeInTheDocument();
  });
});

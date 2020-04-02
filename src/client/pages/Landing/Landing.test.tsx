import AppState, { AppState as AppStateInterface } from '../../AppState';

import Landing from './Landing';
import React from 'react';
import { shallow } from 'enzyme';

const appState = { SESSION: { isAuthenticated: false } } as AppStateInterface;

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <Landing />
    </AppState>
  );
});

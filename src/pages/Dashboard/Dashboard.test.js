import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from './Dashboard';

import AppState from 'AppState';

const appState = {};

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <Dashboard />
    </AppState>
  );
});

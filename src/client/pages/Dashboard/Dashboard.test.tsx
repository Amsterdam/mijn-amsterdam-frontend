import AppState from '../../AppState';
import Dashboard from './Dashboard';
import React from 'react';
import { shallow } from 'enzyme';

const appState = {};

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <Dashboard />
    </AppState>
  );
});

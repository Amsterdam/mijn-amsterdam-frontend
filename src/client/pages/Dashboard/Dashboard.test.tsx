import Dashboard from './Dashboard';
import React from 'react';
import { shallow } from 'enzyme';
import { MockAppStateProvider } from '../../AppStateProvider';

const appState = {};

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={appState}>
      <Dashboard />
    </MockAppStateProvider>
  );
});

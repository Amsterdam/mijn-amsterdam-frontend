import AppState, { AppState as AppStateInterface } from '../../AppState';

import MyNotifications from './MyNotifications';
import React from 'react';
import { shallow } from 'enzyme';

const appState = { UPDATES: {} } as AppStateInterface;

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <MyNotifications />
    </AppState>
  );
});

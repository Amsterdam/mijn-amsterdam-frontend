import { MockAppStateProvider } from '../../AppState';
import MyNotifications from './MyNotifications';
import React from 'react';
import { shallow } from 'enzyme';

const appState = {
  NOTIFICATIONS: {
    total: 0,
    items: [],
  },
};

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={appState}>
      <MyNotifications />
    </MockAppStateProvider>
  );
});

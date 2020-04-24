import { shallow } from 'enzyme';
import React from 'react';
import { MockAppStateProvider } from '../../AppStateProvider';
import MyNotifications from './MyNotifications';
import { AppState } from '../../AppState';

const appState: Partial<AppState> = {
  NOTIFICATIONS: {
    content: {
      total: 0,
      items: [],
    },
    status: 'OK',
  },
};

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={appState}>
      <MyNotifications />
    </MockAppStateProvider>
  );
});

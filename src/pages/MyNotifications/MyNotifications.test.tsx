import React from 'react';
import { shallow } from 'enzyme';
import MyNotifications from './MyNotifications';
import AppState, { AppState as AppStateInterface } from 'AppState';

const appState = { MELDINGEN: {} } as AppStateInterface;

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <MyNotifications />
    </AppState>
  );
});

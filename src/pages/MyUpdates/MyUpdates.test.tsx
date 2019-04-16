import React from 'react';
import { shallow } from 'enzyme';
import MyUpdates from './MyUpdates';
import AppState, { AppState as AppStateInterface } from 'AppState';

const appState = { MY_UPDATES: {} } as AppStateInterface;

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <MyUpdates />
    </AppState>
  );
});

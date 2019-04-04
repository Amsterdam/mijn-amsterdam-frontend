import React from 'react';
import { shallow } from 'enzyme';
import MyUpdates from './MyUpdates';
import AppState from 'AppState';

const appState = { MY_UPDATES: {} };

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <MyUpdates />
    </AppState>
  );
});

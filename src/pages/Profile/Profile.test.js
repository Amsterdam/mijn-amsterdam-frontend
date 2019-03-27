import React from 'react';
import { shallow } from 'enzyme';
import Profile from './Profile';
import AppState from 'AppState';

const appState = {};

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <Profile />
    </AppState>
  );
});

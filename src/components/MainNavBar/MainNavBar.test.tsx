import React from 'react';
import { shallow } from 'enzyme';
import MainNavBar from './MainNavBar';
import AppState from 'AppState';

const appState = {
  SESSION: {
    isAuthenticated: false,
  },
};

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <MainNavBar />
    </AppState>
  );
});

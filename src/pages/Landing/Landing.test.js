import React from 'react';
import { shallow } from 'enzyme';
import Landing from './Landing';
import AppState from 'AppState';

const appState = { SESSION: { isAuthenticated: false } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <Landing />
    </AppState>
  );
});

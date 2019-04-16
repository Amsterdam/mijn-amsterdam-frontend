import React from 'react';
import { shallow } from 'enzyme';
import Landing from './Landing';
import AppState, { AppState as AppStateInterface } from 'AppState';

const appState = { SESSION: { isAuthenticated: false } } as AppStateInterface;

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <Landing />
    </AppState>
  );
});

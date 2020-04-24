import { shallow } from 'enzyme';
import React from 'react';
import { SessionApiState, SessionState } from '../../SessionState';
import Landing from './Landing';

const appState = { isAuthenticated: false } as SessionApiState;

it('Renders without crashing', () => {
  shallow(
    <SessionState value={appState}>
      <Landing />
    </SessionState>
  );
});

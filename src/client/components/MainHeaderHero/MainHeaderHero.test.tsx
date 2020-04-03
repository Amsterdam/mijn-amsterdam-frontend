import { BrowserRouter } from 'react-router-dom';
import MainHeaderHero from './MainHeaderHero';
import React from 'react';
import { SessionApiState } from '../../hooks/api/session.api.hook';
import { SessionContext } from '../../SessionState';
import { shallow } from 'enzyme';

it('Renders without crashing', () => {
  const testState = { isAuthenticated: false } as SessionApiState;
  shallow(
    <BrowserRouter>
      <SessionContext.Provider value={testState}>
        <MainHeaderHero />
      </SessionContext.Provider>
    </BrowserRouter>
  );
});

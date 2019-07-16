import React from 'react';
import { shallow } from 'enzyme';
import MainHeaderHero from './MainHeaderHero';
import { BrowserRouter } from 'react-router-dom';
import { SessionContext } from 'AppState';
import { SessionApiState } from '../../hooks/api/session.api.hook';

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

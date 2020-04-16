import { BrowserRouter } from 'react-router-dom';
import MainHeaderHero from './MainHeaderHero';
import React from 'react';
import { SessionContext } from '../../SessionState';
import { shallow } from 'enzyme';

it('Renders without crashing', () => {
  const testState = { isAuthenticated: false } as any;
  shallow(
    <BrowserRouter>
      <SessionContext.Provider value={testState}>
        <MainHeaderHero />
      </SessionContext.Provider>
    </BrowserRouter>
  );
});

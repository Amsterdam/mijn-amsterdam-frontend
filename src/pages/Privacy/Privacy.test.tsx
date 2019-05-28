import React from 'react';
import { shallow } from 'enzyme';
import Privacy from './Privacy';
import AppState from 'AppState';

const APP_STATE = {}; // Add slice of the AppState here

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <Privacy />
    </AppState>
  );
});

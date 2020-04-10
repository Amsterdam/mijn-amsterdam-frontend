import React from 'react';
import { shallow } from 'enzyme';
import Burgerzaken from './Burgerzaken';
import AppState from 'AppState';

const APP_STATE = {}; // Add slice of the AppState here

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <Burgerzaken />
    </AppState>
  );
});

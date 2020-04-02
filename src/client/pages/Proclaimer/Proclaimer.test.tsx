import AppState from '../../AppState';
import Proclaimer from './Proclaimer';
import React from 'react';
import { shallow } from 'enzyme';

const APP_STATE = {}; // Add slice of the AppState here

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <Proclaimer />
    </AppState>
  );
});

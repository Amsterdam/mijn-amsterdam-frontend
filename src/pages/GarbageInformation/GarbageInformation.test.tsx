import React from 'react';
import { shallow } from 'enzyme';
import GarbageInformation from './GarbageInformation';
import AppState from 'AppState';

const APP_STATE = {}; // Add slice of the AppState here

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <GarbageInformation />
    </AppState>
  );
});

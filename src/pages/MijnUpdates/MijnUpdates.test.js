import React from 'react';
import { shallow } from 'enzyme';
import MijnUpdates from './MijnUpdates';
import AppState from 'AppState';

const appState = { MY_UPDATES: {} };

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState}>
      <MijnUpdates />
    </AppState>
  );
});

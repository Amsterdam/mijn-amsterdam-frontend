import AppState, { AppState as AppStateInterface } from '../../AppState';

import MyArea from './MyArea';
import React from 'react';
import { shallow } from 'enzyme';

const appState = {
  BRP: {},
};

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState as AppStateInterface}>
      <MyArea />
    </AppState>
  );
});

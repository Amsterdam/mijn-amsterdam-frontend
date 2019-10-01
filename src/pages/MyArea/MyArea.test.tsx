import React from 'react';
import { shallow } from 'enzyme';
import MyArea from './MyArea';

import AppState, { AppState as AppStateInterface } from 'AppState';

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

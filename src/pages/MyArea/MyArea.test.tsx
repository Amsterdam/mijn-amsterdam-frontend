import React from 'react';
import { shallow } from 'enzyme';

import AppState, { AppState as AppStateInterface } from 'AppState';
import { MyAreaMap } from 'components/MyArea/MyArea';
import { DEFAULT_CENTROID } from 'config/Map.constants';

const appState = {
  BRP: {},
};

it('Renders without crashing', () => {
  shallow(
    <AppState value={appState as AppStateInterface}>
      <MyAreaMap center={DEFAULT_CENTROID} />
    </AppState>
  );
});

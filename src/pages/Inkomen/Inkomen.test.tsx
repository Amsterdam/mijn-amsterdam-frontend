import React from 'react';
import { shallow } from 'enzyme';
import Inkomen from './Inkomen';
import AppState from 'AppState';

const APP_STATE = { WMO: { data: { items: [] } } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <Inkomen />
    </AppState>
  );
});

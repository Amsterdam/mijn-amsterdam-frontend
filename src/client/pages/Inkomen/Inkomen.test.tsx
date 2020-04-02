import AppState from '../../AppState';
import Inkomen from './Inkomen';
import React from 'react';
import { shallow } from 'enzyme';

const APP_STATE = { WMO: { data: { items: [] } } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <Inkomen />
    </AppState>
  );
});

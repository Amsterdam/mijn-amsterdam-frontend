import AppState from '../../AppState';
import React from 'react';
import Zorg from './Zorg';
import { shallow } from 'enzyme';

const APP_STATE = { WMO: { data: { items: [] } } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <Zorg />
    </AppState>
  );
});

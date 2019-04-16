import React from 'react';
import { shallow } from 'enzyme';
import Zorg from './Zorg';
import AppState from 'AppState';

const APP_STATE = {
  WMO: { data: { items: [] } },
};

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <Zorg />
    </AppState>
  );
});

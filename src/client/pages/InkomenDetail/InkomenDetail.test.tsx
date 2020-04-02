import AppState from '../../AppState';
import InkomenDetail from './InkomenDetail';
import React from 'react';
import { shallow } from 'enzyme';

const APP_STATE = { WMO: { data: { items: [] } } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <InkomenDetail />
    </AppState>
  );
});

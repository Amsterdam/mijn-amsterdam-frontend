import AppState from '../../AppState';
import React from 'react';
import ZorgDetail from './ZorgDetail';
import { shallow } from 'enzyme';

const APP_STATE = { WMO: { data: { items: [] } } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <ZorgDetail />
    </AppState>
  );
});

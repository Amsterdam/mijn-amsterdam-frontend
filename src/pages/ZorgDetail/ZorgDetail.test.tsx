import React from 'react';
import { shallow } from 'enzyme';
import ZorgDetail from './ZorgDetail';
import AppState from 'AppState';

const APP_STATE = { WMO: { data: { items: [] } } };

it('Renders without crashing', () => {
  shallow(
    <AppState value={APP_STATE}>
      <ZorgDetail />
    </AppState>
  );
});

import { shallow } from 'enzyme';
import React from 'react';
import { AppState } from '../../AppState';
import { MockAppStateProvider } from '../../AppStateProvider';
import Zorg from './Zorg';

const APP_STATE: Partial<AppState> = {
  WMO: { content: { items: [] }, status: 'OK' },
};

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={APP_STATE}>
      <Zorg />
    </MockAppStateProvider>
  );
});

import { shallow } from 'enzyme';
import React from 'react';
import { AppState } from '../../AppState';
import { MockAppStateProvider } from '../../AppStateProvider';
import ZorgDetail from './ZorgDetail';

const APP_STATE: Partial<AppState> = {
  WMO: { content: [], status: 'OK' },
};

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={APP_STATE}>
      <ZorgDetail />
    </MockAppStateProvider>
  );
});

import { shallow } from 'enzyme';
import React from 'react';
import { AppState } from '../../AppState';
import { MockAppStateProvider } from '../../AppStateProvider';
import InkomenDetail from './InkomenDetail';

const APP_STATE = { WMO: { content: [], status: 'OK' } } as Partial<AppState>;

it('Renders without crashing', () => {
  shallow(
    <MockAppStateProvider value={APP_STATE}>
      <InkomenDetail />
    </MockAppStateProvider>
  );
});
